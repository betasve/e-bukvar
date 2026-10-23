import { expect, test, vi } from 'vitest'
import { content } from '../../content'
import type { Exercise } from '../../engine/exercises'
import { emptyProgress, type Progress } from '../../engine/progress'
import { LessonSession } from './session'

const exercises: Exercise[] = [
  { kind: 'watch-blend', syllable: 'МА' },
  { kind: 'hear-syllable', syllable: 'МА', options: ['МА', 'АМ'] },
  { kind: 'hear-letter', letter: 'М', options: ['М', 'А', 'О', 'У'] },
  { kind: 'read-match', word: 'МАМА', options: ['МАМА', 'ЛУНА', 'ЛАМА'] },
]

function setup(save: (p: Progress) => Promise<void> = async () => {}) {
  const saved: Progress[] = []
  const stickers: string[] = []
  const deps = {
    save: vi.fn(async (p: Progress) => {
      saved.push(p)
      await save(p)
    }),
    now: () => 100,
    onSticker: (id: string) => stickers.push(id),
  }
  const session = new LessonSession(content, 'r1-s1', exercises, emptyProgress('kid'), deps)
  return { session, saved, stickers, deps }
}

test('unscored exercises advance with next() and record nothing', async () => {
  const { session, deps } = setup()
  expect(session.current?.kind).toBe('watch-blend')
  expect(await session.answer('МА')).toBe('ignored')
  await session.next()
  expect(session.index).toBe(1)
  expect(deps.save).not.toHaveBeenCalled()
})

test('correct first try records firstTry=true and saves', async () => {
  const { session, saved } = setup()
  await session.next()
  expect(await session.answer('МА')).toBe('correct')
  expect(saved).toHaveLength(1)
  expect(saved[0].items['syl:МА']).toMatchObject({ box: 2, recent: [true] })
  expect(session.meter).toBe(1)
})

test('wrong then correct records firstTry=false', async () => {
  const { session, saved } = setup()
  await session.next()
  expect(await session.answer('АМ')).toBe('wrong')
  expect(await session.answer('МА')).toBe('correct')
  expect(saved[0].items['syl:МА']).toMatchObject({ box: 1, recent: [false] })
  expect(session.meter).toBe(0)
})

test('second wrong returns reveal', async () => {
  const { session } = setup()
  await session.next()
  expect(await session.answer('АМ')).toBe('wrong')
  expect(await session.answer('АМ')).toBe('reveal')
  expect(await session.answer('МА')).toBe('correct')
})

test('ignores answers while a previous answer is being handled', async () => {
  let release!: () => void
  const { session, saved } = setup(() => new Promise<void>((r) => (release = r)))
  await session.next()
  const first = session.answer('МА')
  expect(await session.answer('МА')).toBe('ignored')
  expect(await session.answer('АМ')).toBe('ignored')
  release()
  expect(await first).toBe('correct')
  expect(await session.answer('МА')).toBe('ignored') // already solved until next()
  expect(saved).toHaveLength(1)
  expect(session.meter).toBe(1)
})

test('saves after each answer but completes the stop only on finish', async () => {
  const { session, saved } = setup()
  await session.next()
  await session.answer('МА')
  await session.next()
  await session.answer('М')
  await session.next()
  await session.answer('МАМА')
  expect(saved).toHaveLength(3)
  expect(saved[2].stops['r1-s1']).toBeUndefined()
  expect(Object.keys(saved[2].items).sort()).toEqual(['sound:М', 'syl:МА', 'word:МАМА'])
  await session.next()
  expect(session.current).toBeNull()
})

test('finish awards the stop sticker via onSticker', async () => {
  const { session, saved, stickers } = setup()
  for (let i = 0; i < exercises.length; i++) await session.next()
  expect(await session.finish()).toEqual(['r1-1'])
  expect(stickers).toEqual(['r1-1'])
  expect(saved.at(-1)!.stops['r1-s1']).toEqual({ completed: true, plays: 1 })
})
