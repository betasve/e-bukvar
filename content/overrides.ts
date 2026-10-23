import type { ClipOverride } from './types'

// Pronunciation fixes for clips that TTS gets wrong, keyed by clip key (e.g. 'letter:М').
export const overrides: Record<string, ClipOverride> = {
  // "мъ" is read as the letter name "ем"; a bare "м" gives the sound (checked by ear, Kalina voice).
  'letter:М': { text: 'м' },
}
