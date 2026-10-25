// Handwritten letters come from a primer sheet traced into one SVG per letter (see tools/import-hand-letters.ts).
// The sheet's metrics.json says where each letter sat in its cell; all SVGs share one scale.

export interface LetterMetric {
  cell: [number, number] // [row, column] on the sheet
  x: number
  y: number
  w: number
  h: number
  svg_size: [number, number]
  scale: number
  pad: number
}

/** The common frame in sheet units: room above the baseline for capitals and ascenders, below for descenders. */
export const FRAME = { above: 54, height: 82 }

const X_HEIGHT_MAX = 26

/** Baseline of each sheet row: the bottom of its x-height lowercase letters (а, м, к…), the most common value. */
export function rowBaselines(metrics: Record<string, LetterMetric>): Map<number, number> {
  const counts = new Map<number, Map<number, number>>()
  for (const [key, m] of Object.entries(metrics)) {
    if (!key.startsWith('lower/') || m.h > X_HEIGHT_MAX) continue
    const row = counts.get(m.cell[0]) ?? new Map<number, number>()
    row.set(m.y + m.h, (row.get(m.y + m.h) ?? 0) + 1)
    counts.set(m.cell[0], row)
  }
  return new Map(
    [...counts].map(([row, bottoms]) => [row, [...bottoms].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0]]),
  )
}

/** Re-frame a letter's SVG so every letter has the same height and sits on the same baseline. */
export function framedSvg(svg: string, m: LetterMetric, baseline: number): string {
  const top = baseline - FRAME.above
  if (m.y < top || m.y + m.h > top + FRAME.height) throw new Error(`letter at y ${m.y}, h ${m.h} is outside the frame`)
  const [width] = m.svg_size
  const height = FRAME.height * m.scale
  const viewY = (top - (m.y - m.pad)) * m.scale
  return svg.replace(
    /<svg[^>]*>/,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${viewY} ${width} ${height}" width="${width}" height="${height}">`,
  )
}
