// Generates every clip the app needs with Azure TTS. Usage: npm run audio
// Needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env. Only new or changed clips are requested.
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import { allClips, type ClipSpec, type Manifest } from '../content/clips'
import { content } from '../content/index'
import { VOICE } from './audio-config'
import { buildSsml, clipFileName } from './audio-lib'

const OUT = 'public/audio'
const SPACING_MS = 3100 // free tier allows 20 requests per minute
const MAX_RETRIES = 5

process.loadEnvFile()
const key = process.env.AZURE_SPEECH_KEY
const region = process.env.AZURE_SPEECH_REGION
if (!key || !region) {
  console.error('Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env')
  process.exit(1)
}

async function synthesize(spec: ClipSpec): Promise<Buffer> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key!,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'reading-app',
      },
      body: buildSsml(VOICE, spec),
    })
    if (res.ok) return Buffer.from(await res.arrayBuffer())
    if (res.status === 429 && attempt < MAX_RETRIES) {
      const wait = Number(res.headers.get('Retry-After') ?? 10) * 1000
      console.log(`  rate limited, waiting ${wait / 1000}s`)
      await sleep(wait)
      continue
    }
    throw new Error(`${spec.key}: HTTP ${res.status} ${await res.text()}`)
  }
}

mkdirSync(OUT, { recursive: true })
const manifest: Manifest = {}
const specs = allClips(content)
const todo = specs.filter((s) => !existsSync(`${OUT}/${clipFileName(VOICE, s)}`))
console.log(`${specs.length} clips, ${todo.length} to generate`)

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

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(sorted, null, 2) + '\n')
const used = new Set(Object.values(manifest))
for (const f of readdirSync(OUT)) if (f.endsWith('.mp3') && !used.has(f)) rmSync(`${OUT}/${f}`)
process.exit(failed ? 1 : 0)
