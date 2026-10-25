import { expect, test } from 'vitest'
import { handFileName } from '../ui/hand'
import { FRAME, framedSvg, rowBaselines, type LetterMetric } from './hand-letters-lib'

const m = (cell: [number, number], x: number, y: number, w: number, h: number): LetterMetric => ({
  cell,
  x,
  y,
  w,
  h,
  svg_size: [(w + 12) * 8, (h + 12) * 8],
  scale: 8,
  pad: 6,
})

const metrics = {
  'lower/а': m([0, 0], 112, 109, 27, 25),
  'lower/б': m([0, 1], 92, 83, 30, 51),
  'lower/д': m([0, 4], 86, 109, 29, 52),
  'upper/А': m([0, 0], 41, 82, 52, 52),
  'lower/к': m([2, 0], 117, 98, 30, 25),
  'lower/м': m([2, 2], 102, 98, 37, 25),
}

test('rowBaselines takes the bottom of the x-height letters in each row', () => {
  expect(rowBaselines(metrics)).toEqual(new Map([[0, 134], [2, 123]]))
})

const svg = (w: number, h: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><path d="M0,0"/></svg>`

test('framedSvg puts every letter in a frame of the same height, on the same baseline', () => {
  const a = framedSvg(svg(312, 296), metrics['lower/а'], 134)
  const b = framedSvg(svg(336, 504), metrics['lower/б'], 134)
  // а's svg starts 6 cells above its top (y 109); the frame starts FRAME.above cells above the baseline (134).
  expect(a).toContain(`viewBox="0 ${(134 - FRAME.above - (109 - 6)) * 8} 312 ${FRAME.height * 8}"`)
  expect(b).toContain(`viewBox="0 ${(134 - FRAME.above - (83 - 6)) * 8} 336 ${FRAME.height * 8}"`)
  expect(a).toContain(`height="${FRAME.height * 8}"`)
  expect(a).toContain('<path d="M0,0"/>')
})

test('framedSvg refuses a letter that does not fit the frame', () => {
  expect(() => framedSvg(svg(100, 100), m([0, 0], 0, 134 - FRAME.above - 1, 10, 10), 134)).toThrow(/frame/)
  expect(() => framedSvg(svg(100, 100), m([0, 0], 0, 130, 10, FRAME.height), 134)).toThrow(/frame/)
})

test('handFileName is the letter codepoint, so upper and lower case never clash', () => {
  expect(handFileName('м')).toBe('043C.svg')
  expect(handFileName('М')).toBe('041C.svg')
})
