import { createHash } from 'node:crypto'
import type { ClipSpec } from '../content/clips'

/** Content-addressed name: a changed voice, text or rate gives a new file. */
export function clipFileName(voice: string, spec: ClipSpec): string {
  const hash = createHash('sha1')
    .update(`${voice}|${spec.rate ?? ''}|${spec.text}`)
    .digest('hex')
  return `${hash.slice(0, 16)}.mp3`
}
