// Imports the handwritten letters traced from a primer sheet into public/hand/, one framed SVG per letter.
// Usage: npm run hand-letters -- <dir with upper/, lower/ and metrics.json>
// The output is committed; the source folder lives outside the repo.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { handFileName } from '../ui/hand'
import { framedSvg, rowBaselines, type LetterMetric } from './hand-letters-lib'

const SRC = process.argv[2]
const OUT = 'public/hand'
if (!SRC) throw new Error('usage: npm run hand-letters -- <letters dir>')

const metrics: Record<string, LetterMetric> = JSON.parse(readFileSync(`${SRC}/metrics.json`, 'utf8'))
const baselines = rowBaselines(metrics)
mkdirSync(OUT, { recursive: true })
for (const [key, m] of Object.entries(metrics)) {
  const baseline = baselines.get(m.cell[0])
  if (baseline === undefined) throw new Error(`no baseline for row ${m.cell[0]}`)
  const letter = key.split('/')[1]
  writeFileSync(`${OUT}/${handFileName(letter)}`, framedSvg(readFileSync(`${SRC}/${key}.svg`, 'utf8'), m, baseline))
}
console.log(`imported ${Object.keys(metrics).length} handwritten letters`)
