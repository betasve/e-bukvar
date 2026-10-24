import { expect, test } from 'vitest'
import { allStops, content } from '../content'
import { correctAnswer, isScored, itemIdFor, type Exercise } from './exercises'
import { knownLettersThrough, syllablesForStop } from './known'
import { buildLesson } from './lesson'
import { emptyProgress } from './progress'
import { mulberry32 } from './rng'

const lesson = (stopId: string, seed = 1, progress = emptyProgress('p')) =>
  buildLesson(content, stopId, progress, mulberry32(seed))

test('first stop builds a valid lesson with only А and М known', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const ex = lesson('r1-s1', seed)
    expect(ex.length).toBeGreaterThanOrEqual(8)
    expect(ex.length).toBeLessThanOrEqual(12)
    for (const e of ex) {
      if ('options' in e) {
        expect(e.options.length).toBeGreaterThanOrEqual(2)
        expect(e.options).toContain(correctAnswer(e))
      }
    }
  }
})

test('every stop builds 8–12 exercises with valid options', () => {
  for (const stop of allStops(content)) {
    const ex = lesson(stop.id)
    expect(ex.length, stop.id).toBeGreaterThanOrEqual(8)
    expect(ex.length, stop.id).toBeLessThanOrEqual(12)
    for (const e of ex) if ('options' in e) expect(e.options).toContain(correctAnswer(e))
  }
})

test('lesson starts with hear-letter for each new letter', () => {
  const ex = lesson('r1-s1')
  const firstLetters = ex.filter((e) => e.kind === 'hear-letter').slice(0, 2)
  expect(ex[0].kind).toBe('hear-letter')
  expect(firstLetters.map((e) => (e as { letter: string }).letter)).toEqual(['А', 'М'])
})

test('letter stops show one blending demo and no drag-to-blend step', () => {
  for (const stop of allStops(content).filter((s) => s.kind === 'letter')) {
    const kinds: string[] = lesson(stop.id).map((e) => e.kind)
    expect(kinds.filter((k) => k === 'watch-blend'), stop.id).toHaveLength(1)
    expect(kinds, stop.id).not.toContain('blend')
  }
})

test('syllable options only contain known letters', () => {
  for (const stop of allStops(content)) {
    const known = knownLettersThrough(content, stop.id)
    for (let seed = 1; seed <= 5; seed++) {
      for (const e of lesson(stop.id, seed)) {
        if (e.kind !== 'hear-syllable') continue
        for (const o of e.options) for (const ch of o) expect(known, `${stop.id} ${o}`).toContain(ch)
      }
    }
  }
})

test('build-word tiles are a permutation of the word syllables', () => {
  const ex = lesson('r2-s2').find((e) => e.kind === 'build-word') as Extract<Exercise, { kind: 'build-word' }>
  expect(ex).toBeDefined()
  expect([...ex.tiles].sort()).toEqual([...ex.syllables].sort())
  expect(ex.syllables.join('')).toBe(ex.word)
})

test('review includes a box-1 item from an earlier stop', () => {
  const p = emptyProgress('p')
  p.items['syl:МА'] = { box: 1, recent: [false], lastSeen: 1 }
  const ex = lesson('r1-s2', 1, p)
  expect(ex.some((e) => e.kind === 'hear-syllable' && e.syllable === 'МА')).toBe(true)
})

test('read-match options never show the same picture twice', () => {
  for (const stop of allStops(content)) {
    for (let seed = 1; seed <= 20; seed++) {
      for (const e of lesson(stop.id, seed)) {
        if (e.kind !== 'read-match') continue
        const pictures = e.options.map((o) => content.words.find((w) => w.text === o)?.picture)
        expect(pictures.every(Boolean), `${stop.id}: ${e.options}`).toBe(true)
        expect(new Set(pictures).size, `${stop.id}: ${e.options}`).toBe(pictures.length)
      }
    }
  }
})

test('word exercises at a letter stop use words containing the new letter', () => {
  for (const stop of allStops(content).filter((s) => s.kind === 'letter')) {
    for (let seed = 1; seed <= 10; seed++) {
      for (const e of lesson(stop.id, seed)) {
        if (e.kind !== 'build-word' && e.kind !== 'read-match') continue
        if (!stop.words.includes(e.word)) continue // refresher or review word from an earlier stop
        expect(stop.newLetters.some((l) => e.word.includes(l)), `${stop.id}: ${e.word}`).toBe(true)
      }
    }
  }
})

test('story stop contains read-match for each pictured word', () => {
  for (const stop of allStops(content).filter((s) => s.kind === 'story')) {
    const pictured = stop.words.filter((w) => content.words.find((x) => x.text === w)?.picture)
    const matched = lesson(stop.id)
      .filter((e) => e.kind === 'read-match')
      .map((e) => (e as { word: string }).word)
    for (const w of pictured) expect(matched, `${stop.id}: ${w}`).toContain(w)
  }
})

test('itemIdFor and isScored map every exercise kind', () => {
  const cases: [Exercise, string | null, boolean][] = [
    [{ kind: 'hear-letter', letter: 'М', options: ['М'] }, 'sound:М', true],
    [{ kind: 'print-hand', letter: 'М', direction: 'print-to-hand', options: ['М'] }, 'hand:М', true],
    [{ kind: 'watch-blend', syllable: 'МА' }, null, false],
    [{ kind: 'hear-syllable', syllable: 'МА', options: ['МА'] }, 'syl:МА', true],
    [{ kind: 'build-word', word: 'МАМА', syllables: ['МА', 'МА'], tiles: ['МА', 'МА'] }, 'word:МАМА', true],
    [{ kind: 'read-match', word: 'МАМА', options: ['МАМА'] }, 'word:МАМА', true],
  ]
  for (const [ex, id, scored] of cases) {
    expect(itemIdFor(ex)).toBe(id)
    expect(isScored(ex)).toBe(scored)
  }
  expect(correctAnswer(cases.find(([ex]) => ex.kind === 'build-word')![0])).toBe('МА-МА')
})

// Syllables and words taught at the stops before `stopId`, in journey order.
function earlier(stopId: string) {
  const stops = allStops(content)
  const before = stops.slice(0, stops.findIndex((s) => s.id === stopId))
  return {
    syllables: new Set(before.filter((s) => s.kind === 'letter').flatMap((s) => syllablesForStop(content, s.id))),
    words: new Set(before.flatMap((s) => s.words)),
  }
}

const wordOf = (e: Exercise) => (e.kind === 'read-match' || e.kind === 'build-word' ? e.word : null)

test('letter stops after the first end with a refresher of earlier syllables and words', () => {
  for (const stop of allStops(content).filter((s) => s.kind === 'letter').slice(1)) {
    const own = new Set(syllablesForStop(content, stop.id))
    const { syllables, words } = earlier(stop.id)
    for (let seed = 1; seed <= 10; seed++) {
      const ex = lesson(stop.id, seed)
      const oldSyllables = ex.filter((e) => e.kind === 'hear-syllable' && syllables.has(e.syllable) && !own.has(e.syllable))
      const oldWords = ex.filter((e) => wordOf(e) && words.has(wordOf(e)!) && !stop.words.includes(wordOf(e)!))
      expect(oldSyllables.length, `${stop.id} seed ${seed}`).toBeGreaterThanOrEqual(1)
      expect(oldWords.length, `${stop.id} seed ${seed}`).toBeGreaterThanOrEqual(1)
      const last = ex.at(-1)!
      const lastIsOld =
        (last.kind === 'hear-syllable' && syllables.has(last.syllable)) || (wordOf(last) !== null && words.has(wordOf(last)!))
      expect(lastIsOld, `${stop.id} seed ${seed}: lesson should finish with the refresher`).toBe(true)
    }
  }
})

test('the first stop has no refresher', () => {
  const own = new Set(syllablesForStop(content, 'r1-s1'))
  for (const e of lesson('r1-s1')) {
    if (e.kind === 'hear-syllable') expect(own).toContain(e.syllable)
    if (wordOf(e) && e.kind === 'build-word') expect(['МАМА']).toContain(wordOf(e))
  }
})
