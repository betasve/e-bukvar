import { emptyProgress, type Progress } from '../engine/progress'
import { IdbStore } from './idb-store'

export interface Profile {
  id: string
  name: string
  avatar: string // OpenMoji hexcode
}

export interface ProgressStore {
  listProfiles(): Promise<Profile[]>
  saveProfile(p: Profile): Promise<void>
  /** Returns emptyProgress if nothing is saved for this profile. */
  loadProgress(profileId: string): Promise<Progress>
  saveProgress(p: Progress): Promise<void>
}

/** Used when the browser won't give us IndexedDB (private mode, blocked storage). */
export class MemoryStore implements ProgressStore {
  private profiles = new Map<string, Profile>()
  private progress = new Map<string, Progress>()

  async listProfiles() {
    return [...this.profiles.values()].map((p) => structuredClone(p))
  }
  async saveProfile(p: Profile) {
    this.profiles.set(p.id, structuredClone(p))
  }
  async loadProgress(profileId: string) {
    const p = this.progress.get(profileId)
    return p ? structuredClone(p) : emptyProgress(profileId)
  }
  async saveProgress(p: Progress) {
    this.progress.set(p.profileId, structuredClone(p))
  }
}

export async function openStore(): Promise<{ store: ProgressStore; persistent: boolean }> {
  try {
    const store = await IdbStore.open()
    await navigator.storage?.persist?.().catch(() => false)
    return { store, persistent: true }
  } catch {
    return { store: new MemoryStore(), persistent: false }
  }
}
