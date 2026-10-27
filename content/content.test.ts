import { existsSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { handFileName } from '../ui/hand'
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

  test('every word in a letter stop contains one of its new letters', () => {
    for (const stop of allStops(content).filter((s) => s.kind === 'letter')) {
      for (const w of stop.words) {
        expect(stop.newLetters.some((l) => w.includes(l)), `${stop.id}: ${w}`).toBe(true)
      }
    }
  })

  test('no two words share a picture unless they are forms of the same word', () => {
    // МАМА and МАМО share the woman picture; read-match must never offer both at once (see lesson tests).
    const byPicture = new Map<string, string[]>()
    for (const w of content.words) if (w.picture) byPicture.set(w.picture, [...(byPicture.get(w.picture) ?? []), w.text])
    for (const [, texts] of byPicture) if (texts.length > 1) expect(texts.sort()).toEqual(['МАМА', 'МАМО'])
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

  test('every region background image exists in public/regions', () => {
    const withArt = content.regions.filter((r) => r.art)
    expect(withArt.map((r) => r.id)).toEqual(expect.arrayContaining(['r1', 'r2', 'r3', 'r4']))
    for (const r of withArt) expect(existsSync(`public/regions/${r.art}`), r.id).toBe(true)
  })

  test('every taught letter has a handwritten capital and lowercase in public/hand', () => {
    for (const l of allStops(content).flatMap((s) => s.newLetters)) {
      for (const form of [l.toUpperCase(), l.toLowerCase()]) {
        expect(existsSync(`public/hand/${handFileName(form)}`), form).toBe(true)
      }
    }
  })

  test('regions 1–4 use capitals only', () => {
    for (const stop of allStops(content)) expect(stop.case).toBe('upper')
  })
})
