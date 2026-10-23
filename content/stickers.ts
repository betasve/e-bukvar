import type { StickerDef } from './types'

const pool = (regionId: string, pictures: string[], large: string): StickerDef[] => [
  ...pictures.map((picture, i) => ({ id: `${regionId}-${i + 1}`, regionId, picture, large: false })),
  { id: `${regionId}-big`, regionId, picture: large, large: true },
]

export const stickers: StickerDef[] = [
  // Поляна: flowers and small creatures
  ...pool('r1', ['1F33C', '1F33B', '1F338', '1F98B', '1F41E', '1F41D', '1F41B', '1F40C'], '1F308'),
  // Гора: forest animals
  ...pool('r2', ['1F98A', '1F43B', '1F994', '1F98C', '1F989', '1F43F', '1F407', '1F344'], '1F333'),
]
