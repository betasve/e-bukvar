import { existsSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { allStops, content } from './index'

const openmoji = (hex: string) => existsSync(`node_modules/openmoji/color/svg/${hex}.svg`)

function knownThrough(stopId: string): Set<string> {
  const known = new Set<string>()
  for (const stop of allStops(content)) {
    stop.newLetters.forEach((l) => known.add(l))
    if (stop.id === stopId) return known
  }
  throw new Error(`unknown stop ${stopId}`)
}

const wordByText = new Map(content.words.map((w) => [w.text, w]))

describe('content', () => {
  test('each stop uses only letters introduced by then', () => {
    for (const stop of allStops(content)) {
      const known = knownThrough(stop.id)
      for (const w of stop.words) {
        for (const ch of w) expect(known, `${stop.id}: ${w} uses ${ch}`).toContain(ch)
      }
    }
  })

  test('syllable splits rebuild their word', () => {
    for (const w of content.words) expect(w.syllables.join('')).toBe(w.text)
  })

  test('every word referenced by a stop exists in words.ts', () => {
    for (const stop of allStops(content)) {
      for (const w of stop.words) expect(wordByText.has(w), `${stop.id}: ${w}`).toBe(true)
    }
  })

  test('words in letter stops have a picture', () => {
    for (const stop of allStops(content).filter((s) => s.kind === 'letter')) {
      for (const w of stop.words) expect(wordByText.get(w)?.picture, w).toBeTruthy()
    }
  })

  test('every picture exists in openmoji', () => {
    for (const w of content.words) if (w.picture) expect(openmoji(w.picture), w.text).toBe(true)
  })

  test('no letter is introduced twice; letter stops introduce ≥1, story stops 0', () => {
    const seen = new Set<string>()
    for (const stop of allStops(content)) {
      if (stop.kind === 'letter') expect(stop.newLetters.length).toBeGreaterThanOrEqual(1)
      else expect(stop.newLetters).toEqual([])
      for (const l of stop.newLetters) {
        expect(seen.has(l), `${l} introduced twice`).toBe(false)
        expect(content.letters.some((x) => x.id === l)).toBe(true)
        seen.add(l)
      }
    }
  })

  test('every sticker picture exists in openmoji and each region has exactly one large sticker', () => {
    for (const s of content.stickers) expect(openmoji(s.picture), s.id).toBe(true)
    for (const r of content.regions) {
      expect(content.stickers.filter((s) => s.regionId === r.id && s.large)).toHaveLength(1)
    }
  })

  test('all Plan 1 stops are upper case', () => {
    for (const stop of allStops(content)) expect(stop.case).toBe('upper')
  })
})
