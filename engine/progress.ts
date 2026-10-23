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

export function emptyProgress(profileId: string): Progress {
  return { schemaVersion: 1, profileId, stops: {}, items: {}, stickers: [], meter: 0 }
}
