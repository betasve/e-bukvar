import type { LetterId } from '../content'
import type { ItemId } from './progress'

export type Exercise =
  | { kind: 'hear-letter'; letter: LetterId; options: LetterId[] }
  | { kind: 'print-hand'; letter: LetterId; direction: 'print-to-hand' | 'hand-to-print'; options: LetterId[] }
  | { kind: 'watch-blend'; syllable: string }
  | { kind: 'hear-syllable'; syllable: string; options: string[] }
  | { kind: 'build-word'; word: string; syllables: string[]; tiles: string[] } // tiles = shuffled syllables
  | { kind: 'read-match'; word: string; options: string[] } // words, shown as pictures

export function isScored(ex: Exercise): boolean {
  return ex.kind !== 'watch-blend'
}

export function itemIdFor(ex: Exercise): ItemId | null {
  switch (ex.kind) {
    case 'hear-letter':
      return `sound:${ex.letter}`
    case 'print-hand':
      return `hand:${ex.letter}`
    case 'hear-syllable':
      return `syl:${ex.syllable}`
    case 'build-word':
    case 'read-match':
      return `word:${ex.word}`
    case 'watch-blend':
      return null
  }
}

export function correctAnswer(ex: Exercise): string {
  switch (ex.kind) {
    case 'hear-letter':
    case 'print-hand':
      return ex.letter
    case 'watch-blend':
    case 'hear-syllable':
      return ex.syllable
    case 'build-word':
      return ex.syllables.join('-')
    case 'read-match':
      return ex.word
  }
}
