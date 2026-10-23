import { allStops, type Content } from '../content'
import type { Progress } from './progress'

/** A stop opens once the stop before it (in journey order) is completed. */
export function stopStatus(c: Content, p: Progress, stopId: string): 'locked' | 'open' | 'done' {
  if (p.stops[stopId]?.completed) return 'done'
  const stops = allStops(c)
  const i = stops.findIndex((s) => s.id === stopId)
  if (i < 0) throw new Error(`unknown stop ${stopId}`)
  return i === 0 || p.stops[stops[i - 1].id]?.completed ? 'open' : 'locked'
}
