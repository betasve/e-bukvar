import { createHash } from 'node:crypto'
import type { ClipSpec } from '../content/clips'

const xmlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Content-addressed name: a changed voice, text or ssml gives a new file. */
export function clipFileName(voice: string, spec: ClipSpec): string {
  const hash = createHash('sha1').update(`${voice}|${spec.ssml ?? spec.text}`).digest('hex')
  return `${hash.slice(0, 16)}.mp3`
}

export function buildSsml(voice: string, spec: ClipSpec): string {
  const body = spec.ssml ?? xmlEscape(spec.text)
  return `<speak version="1.0" xml:lang="bg-BG"><voice name="${voice}">${body}</voice></speak>`
}
