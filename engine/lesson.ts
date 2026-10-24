import { allStops, type Content } from '../content'
import { letterOptions, syllableOptions } from './distractors'
import type { Exercise } from './exercises'
import { findStop, isVowel, knownLettersThrough, syllablesForStop } from './known'
import type { Progress } from './progress'
import { pick, shuffle, type Rng } from './rng'

const MIN = 8
const MAX = 10
const REVIEW = 2

export function buildLesson(c: Content, stopId: string, progress: Progress, rng: Rng): Exercise[] {
  const stop = findStop(c, stopId)
  const known = knownLettersThrough(c, stopId)
  const core: Exercise[] = []

  const hearSyllable = (s: string): Exercise | null => {
    const options = syllableOptions(rng, s, known, 3)
    return options.length < 2 ? null : { kind: 'hear-syllable', syllable: s, options }
  }
  const readMatch = (word: string): Exercise => {
    const others = c.words.filter((w) => w.picture && w.text !== word).map((w) => w.text)
    return { kind: 'read-match', word, options: shuffle(rng, [word, ...shuffle(rng, others).slice(0, 2)]) }
  }
  const buildWord = (word: string): Exercise | null => {
    const w = c.words.find((x) => x.text === word)!
    return w.syllables.length < 2
      ? null
      : { kind: 'build-word', word, syllables: w.syllables, tiles: shuffle(rng, w.syllables) }
  }
  const pictured = stop.words.filter((w) => c.words.find((x) => x.text === w)?.picture)

  if (stop.kind === 'letter') {
    for (const letter of stop.newLetters) {
      core.push({ kind: 'hear-letter', letter, options: letterOptions(rng, c, letter, 4) })
      core.push({
        kind: 'print-hand',
        letter,
        direction: rng() < 0.5 ? 'print-to-hand' : 'hand-to-print',
        options: letterOptions(rng, c, letter, 3),
      })
    }
    const syllables = syllablesForStop(c, stopId)
    // Prefer consonant+vowel for the blending demo: it is the shape she reads most.
    const cv = syllables.filter((s) => isVowel(c, s[1]))
    const demo = pick(rng, cv.length ? cv : syllables)
    core.push({ kind: 'watch-blend', syllable: demo })
    for (const s of shuffle(rng, syllables).slice(0, 2)) {
      const ex = hearSyllable(s)
      if (ex) core.push(ex)
    }
    const word = pictured.length ? pick(rng, pictured) : null
    if (word) {
      const bw = buildWord(word)
      if (bw) core.push(bw)
      core.push(readMatch(pick(rng, pictured)))
    }
  } else {
    for (const word of pictured) {
      core.push(readMatch(word))
      const bw = buildWord(word)
      if (bw) core.push(bw)
    }
  }

  const review = reviewExercises(c, progress, known, readMatch, hearSyllable, rng).slice(
    0,
    Math.max(0, Math.min(REVIEW, MAX - core.length)),
  )
  const lesson = [...core.slice(0, MAX), ...review]

  // Pad with syllable practice from everything learnt so far.
  const pool = shuffle(rng, syllablesSoFar(c, stopId))
  for (let i = 0; lesson.length < MIN && pool.length > 0 && i < pool.length * 3; i++) {
    const ex = hearSyllable(pool[i % pool.length])
    if (ex) lesson.push(ex)
  }
  return lesson
}

function syllablesSoFar(c: Content, stopId: string): string[] {
  const out = new Set<string>()
  for (const stop of allStops(c)) {
    if (stop.kind === 'letter') syllablesForStop(c, stop.id).forEach((s) => out.add(s))
    if (stop.id === stopId) break
  }
  return [...out]
}

function reviewExercises(
  c: Content,
  progress: Progress,
  known: string[],
  readMatch: (w: string) => Exercise,
  hearSyllable: (s: string) => Exercise | null,
  rng: Rng,
): Exercise[] {
  const knownSet = new Set(known)
  const due = Object.entries(progress.items)
    .filter(([, s]) => s.box <= 2)
    .sort(([, a], [, b]) => a.lastSeen - b.lastSeen)
  const out: Exercise[] = []
  for (const [id] of due) {
    const [type, value] = id.split(':')
    if (![...value].every((ch) => knownSet.has(ch))) continue
    let ex: Exercise | null = null
    if (type === 'sound') ex = { kind: 'hear-letter', letter: value, options: letterOptions(rng, c, value, 4) }
    if (type === 'hand')
      ex = { kind: 'print-hand', letter: value, direction: 'print-to-hand', options: letterOptions(rng, c, value, 3) }
    if (type === 'syl') ex = hearSyllable(value)
    if (type === 'word' && c.words.find((w) => w.text === value)?.picture) ex = readMatch(value)
    if (ex) out.push(ex)
  }
  return out
}
