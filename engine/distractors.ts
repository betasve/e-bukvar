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
 * of the same kind (vowel/consonant). Only syllables that can be written are offered.
 */
export function syllableOptions(rng: Rng, answer: string, known: LetterId[], max: number): string[] {
  const chars = [...answer]
  const reversed = [...chars].reverse().join('')
  const oneOff: string[] = []
  chars.forEach((ch, i) => {
    if (FIXED.has(ch)) return // АЙ → ОЙ, ЛЬО → НЬО: the other letters change, never Й or Ь
    for (const k of known) {
      if (k === ch || vowel.get(k) !== vowel.get(ch)) continue
      oneOff.push(chars.map((x, j) => (j === i ? k : x)).join(''))
    }
  })
  const chosen = [answer]
  for (const s of new Set([reversed, ...shuffle(rng, oneOff)])) {
    if (chosen.length === max) break
    if (!pronounceable(s)) continue
    if (!chosen.some((c) => c === s || soundAlike(c, s))) chosen.push(s)
  }
  return shuffle(rng, chosen)
}

const FIXED = new Set(['Й', 'Ь'])

/** Й and Ь never start a syllable and Й never follows Ъ; Ь is only written before О, never after Ж Ч Ш Щ Ц. */
function pronounceable(s: string): boolean {
  return !/^[ЙЬ]|Ь(?!О)|ЪЙ|[ЖЧШЩЦ]Ь/.test(s)
}

// Letters too alike by ear to tell apart in a choice set: ум/ун, ом/он.
const SOUND_ALIKE = [new Set(['М', 'Н'])]

/** Two syllables that differ in one position only, by a pair of sound-alike letters. */
function soundAlike(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const diff = [...a].flatMap((ch, i) => (ch === b[i] ? [] : [[ch, b[i]]]))
  return diff.length === 1 && SOUND_ALIKE.some((pair) => diff[0].every((ch) => pair.has(ch)))
}
