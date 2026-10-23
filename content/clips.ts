import { syllablesForStop } from '../engine/known'
import { allStops } from './index'
import type { Content, LetterId, PhraseId } from './types'

export interface ClipSpec {
  key: string
  text: string
  ssml?: string
}

/** Clip key → audio file name. */
export type Manifest = Record<string, string>

export const clipKey = {
  letter: (id: LetterId) => `letter:${id}`,
  syllable: (s: string) => `syl:${s}`,
  word: (w: string) => `word:${w}`,
  phrase: (id: PhraseId) => `say:${id}`,
}

/** Every clip the journey needs, with overrides applied. */
export function allClips(c: Content): ClipSpec[] {
  const specs = new Map<string, ClipSpec>()
  const add = (key: string, text: string) => {
    if (!specs.has(key)) specs.set(key, { key, text, ...c.overrides[key] })
  }
  for (const stop of allStops(c)) {
    for (const id of stop.newLetters) add(clipKey.letter(id), c.letters.find((l) => l.id === id)!.soundText)
    for (const s of syllablesForStop(c, stop.id)) add(clipKey.syllable(s), s.toLowerCase())
    for (const w of stop.words) add(clipKey.word(w), w.toLowerCase())
  }
  for (const p of c.phrases) add(clipKey.phrase(p.id), p.text)
  return [...specs.values()]
}
