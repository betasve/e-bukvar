export type LetterId = string // the capital, e.g. 'М'

export interface Letter {
  id: LetterId
  upper: string
  lower: string
  soundText: string // what TTS says for the letter's sound, e.g. 'мъ'
  isVowel: boolean
}

export interface Word {
  text: string // capitals
  syllables: string[]
  picture?: string // OpenMoji hexcode
}

export type StopKind = 'letter' | 'story'

export interface Stop {
  id: string
  regionId: string
  kind: StopKind
  newLetters: LetterId[]
  case: 'upper' | 'mixed'
  words: string[]
}

export interface Region {
  id: string
  name: string
  stops: Stop[]
}

export interface StickerDef {
  id: string
  regionId: string
  picture: string // OpenMoji hexcode
  large: boolean
}

export type PhraseId =
  | 'find-letter'
  | 'match-hand'
  | 'watch-blend'
  | 'drag-blend'
  | 'find-syllable'
  | 'build-word'
  | 'read-word'
  | 'bravo'
  | 'try-again'
  | 'sticker'

export interface Phrase {
  id: PhraseId
  text: string
}

export interface ClipOverride {
  text?: string // spoken instead of the default text
  rate?: string // speaking rate, e.g. '-25%'
}

export interface Content {
  letters: Letter[]
  words: Word[]
  regions: Region[]
  stickers: StickerDef[]
  phrases: Phrase[]
  overrides: Record<string, ClipOverride>
}
