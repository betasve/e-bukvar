import type { Content, LetterId } from '../content'
import { letters } from '../content/letters'
import { shuffle, type Rng } from './rng'

const vowel = new Map(letters.map((l) => [l.id, l.isVowel]))

/** `count` distinct letters including the answer; distractors may be any letter. */
export function letterOptions(rng: Rng, c: Content, answer: LetterId, count: number): LetterId[] {
  const others = shuffle(
    rng,
    c.letters.map((l) => l.id).filter((id) => id !== answer),
  )
  return shuffle(rng, [answer, ...others.slice(0, count - 1)])
}

/**
 * Up to `max` options including the answer. Distractors use only known letters:
 * the reversed syllable first, then syllables differing in one position by a letter
 * of the same kind (vowel/consonant).
 */
export function syllableOptions(rng: Rng, answer: string, known: LetterId[], max: number): string[] {
  const chars = [...answer]
  const reversed = [...chars].reverse().join('')
  const oneOff: string[] = []
  chars.forEach((ch, i) => {
    for (const k of known) {
      if (k === ch || vowel.get(k) !== vowel.get(ch)) continue
      oneOff.push(chars.map((x, j) => (j === i ? k : x)).join(''))
    }
  })
  const chosen = [answer]
  for (const s of new Set([reversed, ...shuffle(rng, oneOff)])) {
    if (chosen.length === max) break
    if (!chosen.some((c) => c === s || soundAlike(c, s))) chosen.push(s)
  }
  return shuffle(rng, chosen)
}

// Letters too alike by ear to tell apart in a choice set: ум/ун, ом/он.
const SOUND_ALIKE = [new Set(['М', 'Н'])]

/** Two syllables that differ in one position only, by a pair of sound-alike letters. */
function soundAlike(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const diff = [...a].flatMap((ch, i) => (ch === b[i] ? [] : [[ch, b[i]]]))
  return diff.length === 1 && SOUND_ALIKE.some((pair) => diff[0].every((ch) => pair.has(ch)))
}
