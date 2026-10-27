import { expect, test } from 'vitest'
import { content } from '../content'
import { completeStop, emptyProgress, knownItems, METER_SIZE, migrateProgress, recordAnswer, type Progress } from './progress'

const answer = (p: Progress, item: string, firstTry: boolean, now = 1) =>
  recordAnswer(content, p, item, firstTry, 'r1', now)

test('first-try correct moves box up and fills meter', () => {
  const { progress } = answer(emptyProgress('p'), 'syl:МА', true)
  expect(progress.items['syl:МА'].box).toBe(2)
  expect(progress.items['syl:МА'].recent).toEqual([true])
  expect(progress.meter).toBe(1)
})

test('miss resets box to 1 and leaves meter', () => {
  let p = answer(emptyProgress('p'), 'syl:МА', true).progress
  p = answer(p, 'syl:МА', true).progress
  const { progress } = answer(p, 'syl:МА', false)
  expect(progress.items['syl:МА'].box).toBe(1)
  expect(progress.meter).toBe(2)
})

test('box never exceeds 5 and recent keeps the last 5', () => {
  let p = emptyProgress('p')
  for (let i = 0; i < 8; i++) p = answer(p, 'sound:М', true).progress
  expect(p.items['sound:М'].box).toBe(5)
  expect(p.items['sound:М'].recent).toHaveLength(5)
  expect(knownItems(p)).toEqual(['sound:М'])
})

test('5th first-try correct awards a region sticker and resets meter', () => {
  let p = emptyProgress('p')
  const stickers: (string | null)[] = []
  for (let i = 0; i < METER_SIZE; i++) {
    const r = answer(p, `syl:${i}`, true, i)
    p = r.progress
    stickers.push(r.sticker)
  }
  expect(stickers.slice(0, METER_SIZE - 1)).toEqual([null, null, null, null])
  expect(stickers[METER_SIZE - 1]).toBe('r1-1')
  expect(p.meter).toBe(0)
  expect(p.stickers.map((s) => s.id)).toEqual(['r1-1'])
})

test('stickers are not awarded twice while uncollected ones remain', () => {
  let p = emptyProgress('p')
  const got: string[] = []
  for (let i = 0; i < METER_SIZE * (content.stickers.length + 4); i++) {
    const r = answer(p, 'syl:МА', true, i)
    p = r.progress
    if (r.sticker) got.push(r.sticker)
  }
  const normal = content.stickers.filter((s) => !s.large).map((s) => s.id)
  expect(got).toEqual(normal) // r1 pool first, then other regions, then nothing
})

test('completeStop always awards one sticker', () => {
  const r = completeStop(content, emptyProgress('p'), 'r1-s1', 5)
  expect(r.stickers).toEqual(['r1-1'])
  expect(r.progress.stops['r1-s1']).toEqual({ completed: true, plays: 1 })
})

test('completing the last stop of a region also awards the large sticker once', () => {
  let p = emptyProgress('p')
  for (const id of ['r1-s1', 'r1-s2', 'r1-s3', 'r1-s4']) p = completeStop(content, p, id, 1).progress
  const last = completeStop(content, p, 'r1-story', 2)
  expect(last.stickers).toContain('r1-big')
  const replay = completeStop(content, last.progress, 'r1-story', 3)
  expect(replay.stickers).not.toContain('r1-big')
  expect(replay.progress.stops['r1-story'].plays).toBe(2)
})

test('recordAnswer does not mutate its input', () => {
  const p = emptyProgress('p')
  const before = structuredClone(p)
  answer(p, 'syl:МА', true)
  completeStop(content, p, 'r1-s1', 1)
  expect(p).toEqual(before)
})

test('a first playthrough earns a new sticker at the end of every stop, even when every answer is right', () => {
  const MAX_SCORED = 12 // a lesson has at most 12 exercises
  let p = emptyProgress('p')
  let t = 0
  for (const region of content.regions) {
    for (const stop of region.stops) {
      for (let i = 0; i < MAX_SCORED; i++) p = recordAnswer(content, p, `syl:${i}`, true, region.id, t++).progress
      const end = completeStop(content, p, stop.id, t++)
      p = end.progress
      const normal = end.stickers.filter((id) => !content.stickers.find((s) => s.id === id)?.large)
      expect(normal, stop.id).toHaveLength(1)
    }
  }
})

test('migrateProgress moves every version 1 stop to its place in the regrouped journey', () => {
  const done = { completed: true, plays: 1 }
  const v1Ids = ['r1-s1', 'r1-s2', 'r1-s3', 'r1-story', 'r2-s1', 'r2-s2', 'r2-s3', 'r2-s4', 'r2-story']
  const v1 = { ...emptyProgress('p'), schemaVersion: 1, stops: Object.fromEntries([...v1Ids, 'r3-s1', 'r3-s2', 'r3-s3', 'r3-s4', 'r3-story'].map((id) => [id, done])) }
  const v2 = migrateProgress(v1)!
  expect(v2.schemaVersion).toBe(2)
  // Each new stop was finished under its old name: А М, О, У, Л | Н, Е, И, Р, С | Т, Ъ.
  expect(Object.keys(v2.stops).sort()).toEqual(
    ['r1-s1', 'r1-s2', 'r1-s3', 'r1-s4', 'r1-story', 'r2-s1', 'r2-s2', 'r2-s3', 'r2-s4', 'r2-s5', 'r2-story', 'r3-s1', 'r3-s2', 'r3-story'].sort(),
  )
  for (const id of Object.keys(v2.stops)) expect(content.regions.flatMap((r) => r.stops).some((s) => s.id === id), id).toBe(true)
  expect(migrateProgress({ ...v2 })).toEqual(v2)
  expect(migrateProgress({ ...v1, schemaVersion: 99 })).toBeNull()
})

test('the regrouped journey puts each version 1 stop letter where the migration says', () => {
  const letterOf = (id: string) => content.regions.flatMap((r) => r.stops).find((s) => s.id === id)!.newLetters.join('')
  expect(['r1-s4', 'r2-s1', 'r2-s4', 'r2-s5', 'r3-s1', 'r3-s2'].map(letterOf)).toEqual(['Л', 'Н', 'Р', 'С', 'Т', 'Ъ'])
})
