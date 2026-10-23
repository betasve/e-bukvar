import type { Manifest } from '../content/clips'

export type Step = { clip: string } | { pause: number } // pause in ms

interface Deps {
  ctx?: AudioContext
  fetch?: typeof fetch
}

const warn = (msg: string) => {
  if (import.meta.env.DEV) console.warn(`[audio] ${msg}`)
}

/**
 * Plays pre-generated clips with Web Audio. Every method resolves even when a clip is
 * missing or audio is unavailable, so the lesson never waits on sound.
 */
export class AudioPlayer {
  private ctx: AudioContext | null
  private fetch: typeof fetch
  private cache = new Map<string, Promise<AudioBuffer | null>>()
  private gen = 0 // bumped by every play/playSequence/stop; stale work checks it and bails
  private current: { source: AudioBufferSourceNode; resolve: () => void } | null = null
  private pause: { resolve: () => void } | null = null

  constructor(
    private manifest: Manifest,
    private baseUrl: string,
    deps: Deps = {},
  ) {
    this.ctx = deps.ctx ?? (typeof AudioContext === 'undefined' ? null : new AudioContext())
    this.fetch = deps.fetch ?? globalThis.fetch.bind(globalThis)
  }

  static async load(baseUrl: string, deps: Deps = {}): Promise<AudioPlayer> {
    const f = deps.fetch ?? globalThis.fetch.bind(globalThis)
    let manifest: Manifest = {}
    try {
      const res = await f(`${baseUrl}audio/manifest.json`)
      if (res.ok) manifest = await res.json()
    } catch {
      warn('manifest unavailable')
    }
    return new AudioPlayer(manifest, baseUrl, deps)
  }

  /** Call from a user tap: browsers (iOS especially) keep audio muted until then. */
  async unlock(): Promise<void> {
    await this.ctx?.resume().catch(() => undefined)
  }

  async preload(keys: string[]): Promise<void> {
    await Promise.all(keys.map((k) => this.buffer(k)))
  }

  play(key: string): Promise<void> {
    return this.playClip(key, this.interrupt())
  }

  async playSequence(steps: Step[]): Promise<void> {
    const gen = this.interrupt()
    for (const step of steps) {
      if (gen !== this.gen) return
      if ('clip' in step) await this.playClip(step.clip, gen)
      else await this.sleep(step.pause)
    }
  }

  stop(): void {
    this.interrupt()
  }

  private interrupt(): number {
    this.gen++
    const current = this.current
    this.current = null
    if (current) {
      try {
        current.source.stop()
      } catch {
        // already stopped
      }
      current.resolve()
    }
    this.pause?.resolve()
    return this.gen
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const done = () => {
        clearTimeout(timer)
        this.pause = null
        resolve()
      }
      const timer = setTimeout(done, ms)
      this.pause = { resolve: done }
    })
  }

  private buffer(key: string): Promise<AudioBuffer | null> {
    let entry = this.cache.get(key)
    if (!entry) {
      entry = this.decode(key)
      this.cache.set(key, entry)
    }
    return entry
  }

  private async decode(key: string): Promise<AudioBuffer | null> {
    const file = this.manifest[key]
    if (!file || !this.ctx) {
      warn(`no clip for ${key}`)
      return null
    }
    try {
      const res = await this.fetch(`${this.baseUrl}audio/${file}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await this.ctx.decodeAudioData(await res.arrayBuffer())
    } catch (e) {
      warn(`failed to load ${key}: ${(e as Error).message}`)
      return null
    }
  }

  private async playClip(key: string, gen: number): Promise<void> {
    const buffer = await this.buffer(key)
    if (!buffer || !this.ctx || gen !== this.gen) return
    const ctx = this.ctx
    return new Promise((resolve) => {
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      const entry = { source, resolve }
      source.onended = () => {
        if (this.current === entry) this.current = null
        resolve()
      }
      this.current = entry
      source.start()
    })
  }
}
