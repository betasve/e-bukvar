import { expect, test } from 'vitest'
import { content } from '../content'
import { letterOptions, syllableOptions } from './distractors'
import { mulberry32 } from './rng'

test('letterOptions returns count distinct letters including the answer', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const opts = letterOptions(mulberry32(seed), content, 'М', 4)
    expect(opts).toHaveLength(4)
    expect(new Set(opts).size).toBe(4)
    expect(opts).toContain('М')
  }
})

test('syllableOptions only uses known letters and differs by one letter or order', () => {
  const known = ['А', 'М', 'О', 'У']
  for (let seed = 1; seed <= 20; seed++) {
    const opts = syllableOptions(mulberry32(seed), 'МА', known, 3)
    expect(opts).toHaveLength(3)
    expect(opts).toContain('МА')
    for (const o of opts.filter((o) => o !== 'МА')) {
      for (const ch of o) expect(known).toContain(ch)
      const reversed = o === 'АМ'
      const oneDiff = o.length === 2 && [...o].filter((ch, i) => ch !== 'МА'[i]).length === 1
      expect(reversed || oneDiff, o).toBe(true)
    }
  }
})

test('syllableOptions for МА with only А М returns МА and АМ', () => {
  expect(new Set(syllableOptions(mulberry32(1), 'МА', ['А', 'М'], 3))).toEqual(new Set(['МА', 'АМ']))
})
