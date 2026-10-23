import { expect, test } from 'vitest'
import type { Exercise } from '../engine/exercises'
import { lessonClips, promptSteps } from './prompts'

test('hear-letter asks then plays the letter sound', () => {
  expect(promptSteps({ kind: 'hear-letter', letter: 'М', options: [] })).toEqual([
    { clip: 'say:find-letter' },
    { pause: 300 },
    { clip: 'letter:М' },
  ])
})

test('watch-blend plays both letters then the syllable', () => {
  expect(promptSteps({ kind: 'watch-blend', syllable: 'МА' })).toEqual([
    { clip: 'say:watch-blend' },
    { pause: 400 },
    { clip: 'letter:М' },
    { pause: 600 },
    { clip: 'letter:А' },
    { pause: 600 },
    { clip: 'syl:МА' },
  ])
})

test('read-match prompt does not say the word', () => {
  expect(promptSteps({ kind: 'read-match', word: 'ЛУНА', options: [] })).toEqual([{ clip: 'say:read-word' }])
})

test('lessonClips covers prompts, feedback phrases, blend result and read-match word', () => {
  const exercises: Exercise[] = [
    { kind: 'blend', syllable: 'МА' },
    { kind: 'read-match', word: 'ЛУНА', options: ['ЛУНА'] },
  ]
  const clips = lessonClips(exercises)
  for (const key of ['say:drag-blend', 'syl:МА', 'say:read-word', 'word:ЛУНА', 'say:bravo', 'say:try-again', 'say:sticker']) {
    expect(clips).toContain(key)
  }
  expect(new Set(clips).size).toBe(clips.length)
})
