import { existsSync, readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { allClips, clipKey } from './clips'
import { content } from './index'
import { letters } from './letters'

const byKey = (c = content) => new Map(allClips(c).map((s) => [s.key, s]))

test('clip keys have a type prefix', () => {
  expect(clipKey.letter('М')).toBe('letter:М')
  expect(clipKey.syllable('МА')).toBe('syl:МА')
  expect(clipKey.word('МАМА')).toBe('word:МАМА')
  expect(clipKey.phrase('bravo')).toBe('say:bravo')
})

test('allClips covers letters, syllables, words and phrases with spoken text', () => {
  const clips = byKey()
  expect(clips.get('letter:А')?.text).toBe('а')
  expect(clips.get('letter:Л')?.text).toBe('лъ')
  expect(clips.get('letter:М')?.text).toBe('м') // override: "мъ" is read as "ем"
  expect(clips.get('syl:МА')?.text).toBe('ма')
  expect(clips.get('syl:АМ')?.text).toBe('ам')
  expect(clips.get('word:ЛИМОН')?.text).toBe('лимон')
  expect(clips.get('say:bravo')?.text).toBe('Браво!')
})

test('the journey teaches every letter of the alphabet', () => {
  const clips = byKey()
  for (const l of letters) expect(clips.has(`letter:${l.id}`), l.id).toBe(true)
})

const loadManifest = (): Record<string, string> => {
  const path = 'public/audio/manifest.json'
  expect(existsSync(path), 'run npm run audio').toBe(true)
  return JSON.parse(readFileSync(path, 'utf8'))
}

test('every clip has a manifest entry and the file exists', () => {
  const manifest = loadManifest()
  for (const spec of allClips(content)) {
    expect(manifest[spec.key], spec.key).toBeTruthy()
    expect(existsSync(`public/audio/${manifest[spec.key]}`), spec.key).toBe(true)
  }
})

test('allClips keys are unique', () => {
  const keys = allClips(content).map((s) => s.key)
  expect(new Set(keys).size).toBe(keys.length)
})

test('overrides replace text or set a speaking rate', () => {
  const clips = byKey({
    ...content,
    overrides: { 'letter:М': { text: 'ммм' }, 'syl:МА': { rate: '-25%' } },
  })
  expect(clips.get('letter:М')).toEqual({ key: 'letter:М', text: 'ммм' })
  expect(clips.get('syl:МА')).toEqual({ key: 'syl:МА', text: 'ма', rate: '-25%' })
})
