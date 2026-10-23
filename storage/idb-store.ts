import { openDB, type IDBPDatabase } from 'idb'
import { emptyProgress, type Progress } from '../engine/progress'
import type { Profile, ProgressStore } from './store'

const DB_NAME = 'reading-app'
const DB_VERSION = 1

export class IdbStore implements ProgressStore {
  private constructor(private db: IDBPDatabase) {}

  static async open(): Promise<IdbStore> {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('profiles', { keyPath: 'id' })
        db.createObjectStore('progress', { keyPath: 'profileId' })
        db.createObjectStore('backups', { autoIncrement: true })
      },
    })
    return new IdbStore(db)
  }

  async listProfiles(): Promise<Profile[]> {
    return this.db.getAll('profiles')
  }

  async saveProfile(p: Profile): Promise<void> {
    await this.db.put('profiles', p)
  }

  async loadProgress(profileId: string): Promise<Progress> {
    const stored = await this.db.get('progress', profileId)
    if (!stored) return emptyProgress(profileId)
    if (stored.schemaVersion !== 1) {
      // Unknown format: keep the raw record so nothing is lost, start fresh.
      await this.db.add('backups', stored)
      return emptyProgress(profileId)
    }
    return stored
  }

  async saveProgress(p: Progress): Promise<void> {
    await this.db.put('progress', p)
  }
}
