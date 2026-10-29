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

test('syllableOptions never offers two syllables that differ only by М and Н (ум/ун, ом/он)', () => {
  const known = ['А', 'М', 'О', 'У', 'Л', 'Н', 'Е', 'И']
  // Same length, one differing position, and that position holds М in one and Н in the other.
  const mnPair = (a: string, b: string) => {
    const diff = [...a].map((ch, i) => [ch, b[i]]).filter(([x, y]) => x !== y)
    return a.length === b.length && diff.length === 1 && new Set(diff[0]).has('М') && new Set(diff[0]).has('Н')
  }
  for (const answer of ['УМ', 'УН', 'ОМ', 'ОН', 'АМ', 'АН', 'МА', 'НА', 'ЕН', 'ИМ']) {
    for (let seed = 1; seed <= 30; seed++) {
      const opts = syllableOptions(mulberry32(seed), answer, known, 3)
      expect(opts.length, answer).toBeGreaterThanOrEqual(2)
      for (const a of opts) for (const b of opts) if (a !== b) expect(mnPair(a, b), `${answer}: ${opts}`).toBe(false)
    }
  }
})

test('syllableOptions never start with Й or Ь, and Ь only comes before О after a consonant that softens', () => {
  const known = [...'АЕИОУЪЛНМТЧЖЙЬ']
  for (const answer of ['УЛ', 'АЙ', 'ЛЬО', 'ТЬО', 'МА', 'ТИ']) {
    for (let seed = 1; seed <= 30; seed++) {
      for (const o of syllableOptions(mulberry32(seed), answer, known, 3)) {
        expect(o, `${answer}: ${o}`).not.toMatch(/^[ЙЬ]|Ь(?!О)|ЪЙ|[ЖЧШЩЦ]Ь/)
      }
    }
  }
})
