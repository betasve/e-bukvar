import { allStops, type Content, type LetterId, type Stop } from '../content'

// Letters that never form a simple two-letter syllable on their own.
const NO_SYLLABLE = new Set(['Ь', 'Й'])
// Й is taught after a vowel (АЙ, ОЙ) and Ь as the soft ЬО after these consonants (ЛЬО, НЬО).
const BEFORE_Й = new Set(['А', 'Е', 'И', 'О', 'У'])
const BEFORE_ЬО = new Set([...'БВГДЗКЛМНПРСТФ'])

export function findStop(c: Content, stopId: string): Stop {
  const stop = allStops(c).find((s) => s.id === stopId)
  if (!stop) throw new Error(`unknown stop ${stopId}`)
  return stop
}

/** Letters introduced up to and including this stop. */
export function knownLettersThrough(c: Content, stopId: string): LetterId[] {
  const known: LetterId[] = []
  for (const stop of allStops(c)) {
    known.push(...stop.newLetters)
    if (stop.id === stopId) return known
  }
  throw new Error(`unknown stop ${stopId}`)
}

export function isVowel(c: Content, id: LetterId): boolean {
  return c.letters.find((l) => l.id === id)?.isVowel ?? false
}

/**
 * Letter stops: every consonant+vowel and vowel+consonant pair from known letters
 * that contains at least one of the stop's new letters; Й and Ь get their own shapes
 * (vowel+Й, consonant+ЬО). Story stops: the syllables of their words.
 */
export function syllablesForStop(c: Content, stopId: string): string[] {
  const stop = findStop(c, stopId)
  if (stop.kind === 'story') {
    const words = stop.words.map((w) => c.words.find((x) => x.text === w)!)
    return [...new Set(words.flatMap((w) => w.syllables))]
  }
  const known = knownLettersThrough(c, stopId).filter((l) => !NO_SYLLABLE.has(l))
  const vowels = known.filter((l) => isVowel(c, l))
  const consonants = known.filter((l) => !isVowel(c, l))
  const fresh = new Set(stop.newLetters)
  const out: string[] = []
  if (fresh.has('Й')) out.push(...vowels.filter((v) => BEFORE_Й.has(v)).map((v) => v + 'Й'))
  if (fresh.has('Ь')) out.push(...consonants.filter((c) => BEFORE_ЬО.has(c)).map((c) => c + 'ЬО'))
  for (const cons of consonants) {
    for (const v of vowels) {
      if (!fresh.has(cons) && !fresh.has(v)) continue
      out.push(cons + v, v + cons)
    }
  }
  return out
}
