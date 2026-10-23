import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AudioPlayer } from './player'

// Each fake clip lasts 500 ms. `started` records [clip url, time] when a clip starts.
let started: [string, number][]

class FakeCtx {
  state = 'suspended'
  destination = {}
  resume = vi.fn(async () => {
    this.state = 'running'
  })
  async decodeAudioData(buf: ArrayBuffer & { url?: string }) {
    return { duration: 0.5, url: buf.url }
  }
  createBufferSource() {
    let timer: ReturnType<typeof setTimeout>
    const node = {
      buffer: null as null | { duration: number; url: string },
      onended: null as null | (() => void),
      connect() {},
      start() {
        started.push([node.buffer!.url, Date.now()])
        timer = setTimeout(() => node.onended?.(), node.buffer!.duration * 1000)
      },
      stop() {
        clearTimeout(timer)
        node.onended?.()
      },
    }
    return node
  }
}

const fakeFetch = (async (url: string) => {
  if (url.endsWith('missing.mp3')) return { ok: false }
  const buf = Object.assign(new ArrayBuffer(1), { url })
  return { ok: true, arrayBuffer: async () => buf }
}) as unknown as typeof fetch

const manifest = { 'syl:МА': 'ma.mp3', 'letter:М': 'm.mp3', 'letter:А': 'a.mp3', 'broken': 'missing.mp3' }
const make = () =>
  new AudioPlayer(manifest, '/base/', { ctx: new FakeCtx() as unknown as AudioContext, fetch: fakeFetch })

beforeEach(() => {
  started = []
  vi.useFakeTimers()
})
afterEach(() => vi.useRealTimers())

test('play resolves for a missing clip', async () => {
  const player = make()
  await expect(player.play('not-in-manifest')).resolves.toBeUndefined()
  await expect(player.play('broken')).resolves.toBeUndefined()
  expect(started).toEqual([])
})

test('play resolves when the clip ends', async () => {
  const player = make()
  await player.preload(['syl:МА'])
  let done = false
  const p = player.play('syl:МА').then(() => (done = true))
  await vi.advanceTimersByTimeAsync(400)
  expect(done).toBe(false)
  await vi.advanceTimersByTimeAsync(200)
  await p
  expect(started.map(([url]) => url)).toEqual(['/base/audio/ma.mp3'])
})

test('playSequence plays clips in order with pauses', async () => {
  const player = make()
  await player.preload(['letter:М', 'letter:А', 'syl:МА'])
  const t0 = Date.now()
  const p = player.playSequence([{ clip: 'letter:М' }, { pause: 300 }, { clip: 'letter:А' }, { clip: 'syl:МА' }])
  await vi.advanceTimersByTimeAsync(2000)
  await p
  expect(started.map(([url, t]) => [url, t - t0])).toEqual([
    ['/base/audio/m.mp3', 0],
    ['/base/audio/a.mp3', 800],
    ['/base/audio/ma.mp3', 1300],
  ])
})

test('stop resolves pending playSequence', async () => {
  const player = make()
  await player.preload(['letter:М', 'letter:А'])
  let done = false
  const p = player.playSequence([{ clip: 'letter:М' }, { pause: 5000 }, { clip: 'letter:А' }]).then(() => (done = true))
  await vi.advanceTimersByTimeAsync(600) // inside the pause
  player.stop()
  await vi.advanceTimersByTimeAsync(0)
  expect(done).toBe(true)
  await p
  expect(started).toHaveLength(1)
})

test('starting a new play stops the current one', async () => {
  const player = make()
  await player.preload(['letter:М', 'letter:А'])
  let first = false
  player.play('letter:М').then(() => (first = true))
  await vi.advanceTimersByTimeAsync(100)
  const second = player.play('letter:А')
  await vi.advanceTimersByTimeAsync(0)
  expect(first).toBe(true)
  await vi.advanceTimersByTimeAsync(600)
  await second
})

test('unlock resumes the audio context', async () => {
  const ctx = new FakeCtx()
  const player = new AudioPlayer(manifest, '/', { ctx: ctx as unknown as AudioContext, fetch: fakeFetch })
  await player.unlock()
  expect(ctx.resume).toHaveBeenCalled()
})

test('load with failing manifest fetch gives a player whose play resolves', async () => {
  const failing = (async () => {
    throw new Error('offline')
  }) as unknown as typeof fetch
  const player = await AudioPlayer.load('/', { ctx: new FakeCtx() as unknown as AudioContext, fetch: failing })
  await expect(player.play('syl:МА')).resolves.toBeUndefined()
})
