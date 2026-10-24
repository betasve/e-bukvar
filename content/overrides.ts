import type { ClipOverride } from './types'

// Pronunciation fixes for clips that TTS gets wrong, keyed by clip key (e.g. 'letter:М').
export const overrides: Record<string, ClipOverride> = {
  // "мъ" is read as the letter name "ем"; a bare "м" gives the sound (checked by ear, Kalina voice).
  'letter:М': { text: 'м' },
  // Vowel+consonant syllables read as abbreviations or letter names ("ал." → "Александър", "ел" → "елъ").
  'syl:АЛ': { text: 'аал' },
  'syl:ЕЛ': { text: 'еел' },
  'syl:ЕН': { text: 'еен' },
}
