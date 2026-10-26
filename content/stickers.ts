import type { StickerDef } from './types'

const pool = (regionId: string, pictures: string[], large: string): StickerDef[] => [
  ...pictures.map((picture, i) => ({ id: `${regionId}-${i + 1}`, regionId, picture, large: false })),
  { id: `${regionId}-big`, regionId, picture: large, large: true },
]

export const stickers: StickerDef[] = [
  // Each region needs enough for every stop end plus the star meter (about 3 per stop) on a first playthrough.
  // Поляна: flowers and small creatures
  ...pool(
    'r1',
    // prettier-ignore
    ['1F33C', '1F33B', '1F338', '1F98B', '1F41E', '1F41D', '1F41B', '1F40C',
     '1F33A', '1F339', '1F340', '1F997', '1F41C', '1F424', '1F353', '1F426'],
    '1F308',
  ),
  // Гора: forest animals
  ...pool(
    'r2',
    // prettier-ignore
    ['1F98A', '1F43B', '1F994', '1F98C', '1F989', '1F43F', '1F407', '1F344',
     '1F43A', '1F417', '1F9A1', '1F99D', '1F330', '1F341', '1F985', '1F343'],
    '1F333',
  ),
]
