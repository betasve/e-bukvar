// Generates every clip the app needs with Microsoft Edge's read-aloud voices (msedge-tts).
// Usage: npm run audio. No account or key needed. Only new or changed clips are requested.
// Note: this is an unofficial client of the Edge read-aloud service; generated files are committed,
// so the app keeps working even if the service changes.
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { allClips, type ClipSpec, type Manifest } from '../content/clips'
import { content } from '../content/index'
import { VOICE } from './audio-config'
import { clipFileName } from './audio-lib'

const OUT = 'public/audio'
const SPACING_MS = 1000 // faster than this and the service answers 429 after ~60 clips
const MAX_ATTEMPTS = 6
const BACKOFF_MS = 30_000 // grows linearly; a refused service needs a few minutes to cool down

let tts: MsEdgeTTS

async function connect(): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    try {
      tts = new MsEdgeTTS()
      await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
      return
    } catch (e) {
      if (attempt >= MAX_ATTEMPTS) throw e
      console.log(`  service refused the connection, waiting ${(BACKOFF_MS * attempt) / 1000}s`)
      await sleep(BACKOFF_MS * attempt)
    }
  }
}

async function synthesize(spec: ClipSpec): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    try {
      const { audioStream } = tts.toStream(spec.text, spec.rate ? { rate: spec.rate } : undefined)
      const chunks: Buffer[] = []
      for await (const chunk of audioStream) chunks.push(chunk as Buffer)
      const audio = Buffer.concat(chunks)
      if (audio.length === 0) throw new Error('empty audio')
      return audio
    } catch (e) {
      if (attempt >= MAX_ATTEMPTS) throw new Error(`${spec.key}: ${(e as Error).message}`)
      console.log(`  ${spec.key} failed (${(e as Error).message}), waiting ${(BACKOFF_MS * attempt) / 1000}s`)
      await sleep(BACKOFF_MS * attempt)
      tts.close()
      await connect()
    }
  }
}

mkdirSync(OUT, { recursive: true })
await connect()

const manifest: Manifest = {}
const specs = allClips(content)
const todo = specs.filter((s) => !existsSync(`${OUT}/${clipFileName(VOICE, s)}`))
console.log(`${specs.length} clips, ${todo.length} to generate with ${VOICE}`)

let failed = false
for (const spec of specs) {
  const file = clipFileName(VOICE, spec)
  if (!existsSync(`${OUT}/${file}`)) {
    try {
      writeFileSync(`${OUT}/${file}`, await synthesize(spec))
      console.log(`  ✓ ${spec.key}`)
      await sleep(SPACING_MS)
    } catch (e) {
      console.error(`  ✗ ${(e as Error).message}`)
      failed = true
      continue
    }
  }
  manifest[spec.key] = file
}
tts.close()

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(sorted, null, 2) + '\n')
const used = new Set(Object.values(manifest))
for (const f of readdirSync(OUT)) if (f.endsWith('.mp3') && !used.has(f)) rmSync(`${OUT}/${f}`)
process.exit(failed ? 1 : 0)
