import { expect, test } from 'vitest'
import { content } from '../content'
import { knownLettersThrough, syllablesForStop } from './known'
import { mulberry32 } from './rng'

test('mulberry32 is deterministic', () => {
  expect(mulberry32(1)()).toBe(mulberry32(1)())
  expect(mulberry32(1)()).not.toBe(mulberry32(2)())
})

test('knownLettersThrough r1-s2 is А М О', () => {
  expect(new Set(knownLettersThrough(content, 'r1-s2'))).toEqual(new Set(['А', 'М', 'О']))
})

test('syllablesForStop r1-s1 is МА and АМ', () => {
  expect(new Set(syllablesForStop(content, 'r1-s1'))).toEqual(new Set(['МА', 'АМ']))
})

test('syllablesForStop r1-s2 contains МО and ОМ but not МА', () => {
  const s = syllablesForStop(content, 'r1-s2')
  expect(s).toContain('МО')
  expect(s).toContain('ОМ')
  expect(s).not.toContain('МА')
})

test('syllablesForStop for a story stop is the syllables of its words', () => {
  expect(new Set(syllablesForStop(content, 'r1-story'))).toEqual(new Set(['МА', 'МО']))
})
