import type { ClipOverride } from './types'

// Pronunciation fixes for clips that TTS gets wrong, keyed by clip key (e.g. 'letter:М').
export const overrides: Record<string, ClipOverride> = {}
