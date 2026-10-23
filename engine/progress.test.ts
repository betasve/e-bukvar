import { expect, test } from 'vitest'
import { content } from '../content'
import { completeStop, emptyProgress, knownItems, METER_SIZE, recordAnswer, type Progress } from './progress'

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
  for (let i = 0; i < METER_SIZE * 20; i++) {
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
  for (const id of ['r1-s1', 'r1-s2', 'r1-s3']) p = completeStop(content, p, id, 1).progress
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
