import type { StickerDef } from './types'

const pool = (regionId: string, pictures: string[], large: string): StickerDef[] => [
  ...pictures.map((picture, i) => ({ id: `${regionId}-${i + 1}`, regionId, picture, large: false })),
  { id: `${regionId}-big`, regionId, picture: large, large: true },
]

export const stickers: StickerDef[] = [
  // Each region needs enough for every stop end plus the star meter (about 3 per stop) on a first playthrough:
  // 20 covers a five-letter region plus its story stop.
  // Поляна: flowers and small creatures
  ...pool(
    'r1',
    // prettier-ignore
    ['1F33C', '1F33B', '1F338', '1F98B', '1F41E', '1F41D', '1F41B', '1F40C',
     '1F33A', '1F339', '1F340', '1F997', '1F41C', '1F424', '1F353', '1F426',
     '1FAB2', '1F33E', '1F31E', '1FABB'],
    '1F308',
  ),
  // Гора: forest animals
  ...pool(
    'r2',
    // prettier-ignore
    ['1F98A', '1F43B', '1F994', '1F98C', '1F989', '1F43F', '1F407', '1F344',
     '1F43A', '1F417', '1F9A1', '1F99D', '1F330', '1F341', '1F985', '1F343',
     '1FAB9', '1F40D', '1F426-200D-2B1B', '1FAB5'],
    '1F333',
  ),
  // Река: water animals and boats
  ...pool(
    'r3',
    // prettier-ignore
    ['1F986', '1F438', '1F41F', '1F420', '1F421', '1F422', '1F980', '1F990',
     '1F9A6', '1F9AB', '1F9A2', '1FAB7', '1F41A', '26F5', '1F3A3', '1F9A9',
     '1F99E', '1FAA8', '1F327', '1F3D5'],
    '1F6F6',
  ),
]
