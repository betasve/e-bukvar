import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { openDB } from 'idb'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { emptyProgress, type Progress } from '../engine/progress'
import { IdbStore } from './idb-store'
import { MemoryStore, openStore, type ProgressStore } from './store'

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  vi.restoreAllMocks()
})

const stores: [string, () => Promise<ProgressStore>][] = [
  ['MemoryStore', async () => new MemoryStore()],
  ['IdbStore', () => IdbStore.open()],
]

const sample = (): Progress => ({
  ...emptyProgress('kid'),
  stops: { 'r1-s1': { completed: true, plays: 2 } },
  items: { 'syl:МА': { box: 3, recent: [true, false, true], lastSeen: 42 } },
  stickers: [{ id: 'r1-1', at: 7 }],
  meter: 3,
})

describe.each(stores)('%s', (_name, make) => {
  test('saveProfile then listProfiles returns it', async () => {
    const store = await make()
    await store.saveProfile({ id: 'kid', name: 'Мария', avatar: '1F98A' })
    expect(await store.listProfiles()).toEqual([{ id: 'kid', name: 'Мария', avatar: '1F98A' }])
  })

  test('loadProgress for an unknown profile returns emptyProgress', async () => {
    const store = await make()
    expect(await store.loadProgress('nobody')).toEqual(emptyProgress('nobody'))
  })

  test('saveProgress then loadProgress round-trips identically', async () => {
    const store = await make()
    await store.saveProgress(sample())
    expect(await store.loadProgress('kid')).toEqual(sample())
  })
})

test('IdbStore persists across reopening', async () => {
  await (await IdbStore.open()).saveProgress(sample())
  expect(await (await IdbStore.open()).loadProgress('kid')).toEqual(sample())
})

test('unknown schemaVersion is backed up and replaced by empty progress', async () => {
  const store = await IdbStore.open()
  const db = await openDB('reading-app', 1)
  const future = { ...sample(), schemaVersion: 99 }
  await db.put('progress', future)
  expect(await store.loadProgress('kid')).toEqual(emptyProgress('kid'))
  expect(await db.getAll('backups')).toEqual([future])
})

test('version 1 progress is backed up and converted to the regrouped journey', async () => {
  const store = await IdbStore.open()
  const db = await openDB('reading-app', 1)
  // Old layout: Л was Гора's first stop (r2-s1), Р and С were Река's first stops.
  const v1 = {
    ...sample(),
    schemaVersion: 1,
    stops: { 'r2-s1': { completed: true, plays: 1 }, 'r3-s2': { completed: true, plays: 3 } },
  }
  await db.put('progress', v1)
  const loaded = await store.loadProgress('kid')
  expect(loaded.schemaVersion).toBe(2)
  expect(loaded.stops).toEqual({ 'r1-s4': { completed: true, plays: 1 }, 'r2-s5': { completed: true, plays: 3 } })
  expect(await db.getAll('backups')).toEqual([v1])
  expect(await store.loadProgress('kid')).toEqual(loaded) // converted once, then saved
})

test('openStore falls back to MemoryStore when indexedDB.open throws', async () => {
  vi.spyOn(indexedDB, 'open').mockImplementation(() => {
    throw new Error('blocked')
  })
  const { store, persistent } = await openStore()
  expect(store).toBeInstanceOf(MemoryStore)
  expect(persistent).toBe(false)
})

test('openStore uses IndexedDB when available', async () => {
  const { store, persistent } = await openStore()
  expect(store).toBeInstanceOf(IdbStore)
  expect(persistent).toBe(true)
})
