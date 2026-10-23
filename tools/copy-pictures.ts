// Copies the OpenMoji SVGs the app uses into public/pictures/. Runs before dev and build.
import { copyFileSync, mkdirSync } from 'node:fs'
import { content } from '../content/index'
import { AVATARS } from '../ui/avatars'

const SRC = 'node_modules/openmoji/color/svg'
const OUT = 'public/pictures'

const hexes = new Set([
  ...content.words.flatMap((w) => (w.picture ? [w.picture] : [])),
  ...content.stickers.map((s) => s.picture),
  ...AVATARS,
])
mkdirSync(OUT, { recursive: true })
for (const hex of hexes) copyFileSync(`${SRC}/${hex}.svg`, `${OUT}/${hex}.svg`)
console.log(`copied ${hexes.size} pictures`)
