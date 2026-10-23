import type { Letter } from './types'

const VOWELS = 'АЕИОУЪЮЯ'
const SPECIAL: Record<string, string> = { Й: 'и кратко', Ь: 'ер малък' }

function soundText(upper: string): string {
  if (SPECIAL[upper]) return SPECIAL[upper]
  const lower = upper.toLowerCase()
  return VOWELS.includes(upper) ? lower : `${lower}ъ`
}

export const letters: Letter[] = [...'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ'].map((upper) => ({
  id: upper,
  upper,
  lower: upper.toLowerCase(),
  soundText: soundText(upper),
  isVowel: VOWELS.includes(upper),
}))
