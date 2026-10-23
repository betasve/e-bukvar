import { expect, test } from 'vitest'
import { buildSsml, clipFileName } from './audio-lib'

const voice = 'bg-BG-KalinaNeural'

test('clipFileName is a stable 16-hex-char mp3 name', () => {
  const name = clipFileName(voice, { key: 'syl:МА', text: 'ма' })
  expect(name).toMatch(/^[0-9a-f]{16}\.mp3$/)
  expect(clipFileName(voice, { key: 'syl:МА', text: 'ма' })).toBe(name)
})

test('clipFileName changes when voice, text or ssml changes', () => {
  const base = clipFileName(voice, { key: 'k', text: 'ма' })
  expect(clipFileName('bg-BG-BorislavNeural', { key: 'k', text: 'ма' })).not.toBe(base)
  expect(clipFileName(voice, { key: 'k', text: 'мо' })).not.toBe(base)
  expect(clipFileName(voice, { key: 'k', text: 'ма', ssml: '<break/>ма' })).not.toBe(base)
})

test('buildSsml escapes plain text', () => {
  expect(buildSsml(voice, { key: 'k', text: 'а & <б>' })).toBe(
    `<speak version="1.0" xml:lang="bg-BG"><voice name="${voice}">а &amp; &lt;б&gt;</voice></speak>`,
  )
})

test('buildSsml uses ssml override as-is', () => {
  expect(buildSsml(voice, { key: 'k', text: 'ма', ssml: '<prosody rate="-20%">ма</prosody>' })).toBe(
    `<speak version="1.0" xml:lang="bg-BG"><voice name="${voice}"><prosody rate="-20%">ма</prosody></voice></speak>`,
  )
})
