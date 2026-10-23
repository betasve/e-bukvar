// Dev-only page (npm run dev → /review.html) to listen to every clip and flag bad ones.
import { allClips, type Manifest } from '../../content/clips'
import { content } from '../../content/index'

const FLAGS_KEY = 'review-flags'
const GROUPS: [string, string][] = [
  ['letter:', 'Letter sounds'],
  ['syl:', 'Syllables'],
  ['word:', 'Words'],
  ['say:', 'Phrases'],
]

function loadFlags(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(FLAGS_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

function saveFlags(flags: Set<string>) {
  try {
    localStorage.setItem(FLAGS_KEY, JSON.stringify([...flags]))
  } catch {
    // flags just won't survive a reload
  }
}

async function main() {
  const manifest: Manifest = await fetch('/audio/manifest.json')
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}))
  const flags = loadFlags()
  const list = document.getElementById('list')!
  const count = document.getElementById('count')!
  const updateCount = () => (count.textContent = `${flags.size} flagged`)

  for (const [prefix, title] of GROUPS) {
    const h = document.createElement('h2')
    h.textContent = title
    list.append(h)
    for (const spec of allClips(content).filter((s) => s.key.startsWith(prefix))) {
      const row = document.createElement('div')
      row.className = 'row'
      const file = manifest[spec.key]
      const play = document.createElement('button')
      play.textContent = '▶'
      play.disabled = !file
      play.onclick = () => new Audio(`/audio/${file}`).play()
      const text = document.createElement('div')
      text.className = 'text'
      text.textContent = `${spec.text} `
      const key = document.createElement('span')
      key.className = 'key'
      key.textContent = file ? spec.key : `${spec.key} — no audio`
      text.append(key)
      const label = document.createElement('label')
      const box = document.createElement('input')
      box.type = 'checkbox'
      box.checked = flags.has(spec.key)
      row.classList.toggle('bad', box.checked)
      box.onchange = () => {
        if (box.checked) flags.add(spec.key)
        else flags.delete(spec.key)
        row.classList.toggle('bad', box.checked)
        saveFlags(flags)
        updateCount()
      }
      label.append(box, ' лошо')
      row.append(play, text, label)
      list.append(row)
    }
  }
  updateCount()
  document.getElementById('copy')!.onclick = () => navigator.clipboard.writeText([...flags].join('\n'))
}

main()
