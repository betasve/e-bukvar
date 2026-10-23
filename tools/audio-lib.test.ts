import { expect, test } from 'vitest'
import { clipFileName } from './audio-lib'

const voice = 'bg-BG-KalinaNeural'

test('clipFileName is a stable 16-hex-char mp3 name', () => {
  const name = clipFileName(voice, { key: 'syl:МА', text: 'ма' })
  expect(name).toMatch(/^[0-9a-f]{16}\.mp3$/)
  expect(clipFileName(voice, { key: 'syl:МА', text: 'ма' })).toBe(name)
})

test('clipFileName changes when voice, text or rate changes', () => {
  const base = clipFileName(voice, { key: 'k', text: 'ма' })
  expect(clipFileName('bg-BG-BorislavNeural', { key: 'k', text: 'ма' })).not.toBe(base)
  expect(clipFileName(voice, { key: 'k', text: 'мо' })).not.toBe(base)
  expect(clipFileName(voice, { key: 'k', text: 'ма', rate: '-25%' })).not.toBe(base)
})

test('clipFileName ignores the key', () => {
  expect(clipFileName(voice, { key: 'a', text: 'ма' })).toBe(clipFileName(voice, { key: 'b', text: 'ма' }))
})
