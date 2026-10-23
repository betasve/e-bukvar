import { letters } from './letters'
import { overrides } from './overrides'
import { phrases } from './phrases'
import { regions } from './regions'
import { stickers } from './stickers'
import type { Content, Stop } from './types'
import { words } from './words'

export * from './types'

export const content: Content = { letters, words, regions, stickers, phrases, overrides }

/** All stops in journey order. */
export function allStops(c: Content): Stop[] {
  return c.regions.flatMap((r) => r.stops)
}
