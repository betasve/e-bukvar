import type { Content } from '../content'

/** 'sound:М' | 'hand:М' | 'syl:МА' | 'word:МАМА' */
export type ItemId = string

export interface ItemState {
  box: 1 | 2 | 3 | 4 | 5
  recent: boolean[] // last 5 first-try results, newest last
  lastSeen: number
}

export interface Progress {
  schemaVersion: 1
  profileId: string
  stops: Record<string, { completed: boolean; plays: number }>
  items: Record<ItemId, ItemState>
  stickers: { id: string; at: number }[]
  meter: number
}

export const METER_SIZE = 5

export function emptyProgress(profileId: string): Progress {
  return { schemaVersion: 1, profileId, stops: {}, items: {}, stickers: [], meter: 0 }
}

/** Items she knows: review box 3 or higher. */
export function knownItems(p: Progress): ItemId[] {
  return Object.entries(p.items)
    .filter(([, s]) => s.box >= 3)
    .map(([id]) => id)
}

/** Next uncollected normal sticker: this region's first, then any region's. */
function nextSticker(c: Content, p: Progress, regionId: string): string | null {
  const have = new Set(p.stickers.map((s) => s.id))
  const free = c.stickers.filter((s) => !s.large && !have.has(s.id))
  return (free.find((s) => s.regionId === regionId) ?? free[0])?.id ?? null
}

function award(p: Progress, id: string | null, now: number): Progress {
  return id ? { ...p, stickers: [...p.stickers, { id, at: now }] } : p
}

export function recordAnswer(
  c: Content,
  p: Progress,
  item: ItemId,
  firstTry: boolean,
  regionId: string,
  now: number,
): { progress: Progress; sticker: string | null } {
  const prev = p.items[item] ?? { box: 1, recent: [], lastSeen: now }
  const box = (firstTry ? Math.min(5, prev.box + 1) : 1) as ItemState['box']
  const state: ItemState = { box, recent: [...prev.recent, firstTry].slice(-5), lastSeen: now }
  let next: Progress = { ...p, items: { ...p.items, [item]: state } }
  if (!firstTry) return { progress: next, sticker: null }

  const meter = p.meter + 1
  if (meter < METER_SIZE) return { progress: { ...next, meter }, sticker: null }
  next = { ...next, meter: 0 }
  const sticker = nextSticker(c, next, regionId)
  return { progress: award(next, sticker, now), sticker }
}

export function completeStop(
  c: Content,
  p: Progress,
  stopId: string,
  now: number,
): { progress: Progress; stickers: string[] } {
  const region = c.regions.find((r) => r.stops.some((s) => s.id === stopId))
  if (!region) throw new Error(`unknown stop ${stopId}`)
  const plays = (p.stops[stopId]?.plays ?? 0) + 1
  let next: Progress = { ...p, stops: { ...p.stops, [stopId]: { completed: true, plays } } }
  const stickers: string[] = []

  const sticker = nextSticker(c, next, region.id)
  next = award(next, sticker, now)
  if (sticker) stickers.push(sticker)

  const large = c.stickers.find((s) => s.regionId === region.id && s.large)
  const regionDone = region.stops.every((s) => next.stops[s.id]?.completed)
  if (large && regionDone && !next.stickers.some((s) => s.id === large.id)) {
    next = award(next, large.id, now)
    stickers.push(large.id)
  }
  return { progress: next, stickers }
}
