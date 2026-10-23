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
  const candidates = [...new Set([reversed, ...shuffle(rng, oneOff)])].filter((s) => s !== answer)
  return shuffle(rng, [answer, ...candidates.slice(0, max - 1)])
}
