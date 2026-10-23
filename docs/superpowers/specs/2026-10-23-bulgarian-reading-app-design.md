# Bulgarian Reading App — Design

**Date:** 2026-10-23
**Status:** Draft, awaiting review

## 1. Purpose

A web app that teaches a 6-year-old to read in Bulgarian. The primary user is the author's daughter; friends' children may use it later. It is not a public or commercial product.

**The problem it solves:** she knows most letters but struggles to blend them into syllables. Existing Bulgarian apps (Буквар БГ, Учи с мен, etc.) teach the alphabet but stop before blending and reading words.

**Success:** after a few weeks of regular use she can read simple syllables and short words (МАМА, ЛУНА, РИБА) on her own.

## 2. Scope

### In scope
- Letter section: printed and handwritten (ръкописни) letters, **recognition only**.
- Blending: letters → syllables → words → short phrases.
- Journey map with regions and stops; sticker rewards and a sticker album.
- Multiple child profiles per device; parent area.
- Works offline, installable on any device (PWA).

### Out of scope (for now)
- Tracing / writing handwritten letters. Letter data should not block adding it later.
- Speech recognition (checking her reading aloud).
- Backend, accounts, cross-device sync. Storage sits behind an interface so sync can be added later.
- App-store distribution, monetisation, non-Bulgarian UI.

## 3. Key decisions

| Decision | Choice | Reason |
|---|---|---|
| Platform | Static web app, installable PWA | Runs on any device from a link; offline after first visit |
| Stack | TypeScript + Svelte + Vite, HTML/CSS rendering | Least code for this UI; normal text/font handling for Cyrillic and handwriting. Rust/WASM and canvas engines (Phaser) rejected as adding friction without benefit |
| Backend | None | All content is static; progress is per device |
| Hosting | Free static host (GitHub Pages / Netlify / Cloudflare Pages) | No cost, share by link |
| Audio | Generated once at build time with Azure TTS (free F0 tier, Bulgarian neural voice); committed MP3 files | No recordings; total volume (~10–20k chars) is far under the free tier; runtime has no TTS dependency |
| Pictures | OpenMoji (CC BY-SA 4.0, attribution required) | Free, consistent illustrations across devices |
| Interface language | Bulgarian only; instructions spoken + icons | The child cannot read instructions yet |
| Letter case | Capitals first; lowercase introduced from region 4 | Matches common primer practice |

## 4. Architecture

```
content/   Teaching data only: letters, regions/stops in order, syllables,
           words with syllable splits, stickers, pronunciation overrides.
engine/    Pure TypeScript, no UI or storage. Builds exercises for a stop,
           checks answers, tracks item mastery (review boxes), awards stickers.
audio/     Preloading, sequenced playback with timing, iOS audio unlock.
storage/   ProgressStore interface; IndexedDB implementation; export/import.
ui/        Svelte screens: profile picker → journey map → lesson → sticker
           album; parent area.
tools/     Dev-only: generate-audio script; audio review page.
```

**Boundaries:** `engine` knows nothing about the UI or storage; `ui` talks to `engine` and `storage` only through their interfaces. Teaching behaviour can change without touching the UI, and `engine` is testable without a browser.

**Lesson flow:** tap a stop → `engine` builds the exercise set from `content` → `ui` renders each exercise while `audio` plays prompts → answer → `engine` scores it, updates mastery and stickers → `storage` saves → after the set, back to the map.

## 5. Learning design

### 5.1 Journey and letter order

Six regions on a map, each a group of letters. Order is chosen so real syllables are possible from the first stop: vowels and continuant consonants first, hard letters last.

| # | Region | Letters | Example words |
|---|---|---|---|
| 1 | Поляна | А, М, О, У | МАМА |
| 2 | Гора | Л, Н, Е, И | ЛУНА, ЛАМА, ЛИМОН |
| 3 | Река | Р, С, Т, Ъ | СОМ, СТОЛ, ТОРТА |
| 4 | Планина | Б, В, П, Д, К, Г | БАБА, ДОМ, РИБА, КОТКА |
| 5 | Село | З, Ж, Ш, Ч, Ц, Х, Ф, Й | ЖАБА, ЧАША, ШАПКА |
| 6 | Море | Я, Ю, Щ, Ь | ЯБЪЛКА, ЯГОДА |

- Each **stop** introduces one new letter. Blending at a stop uses only letters already introduced.
- Each region ends with a **story stop**: a few words, later short phrases.
- **Letter case:** regions 1–3 use capitals only (print and handwritten). Region 4 opens with a **"малки букви" stop** introducing lowercase for the 12 letters known so far. From region 4 on, new letters come as capital + lowercase pairs and exercises mix both, shifting towards lowercase. Case is a per-stop setting in `content/`.
- Letters are voiced by their sound names ("а", "мъ", "лъ"), as taught in Bulgarian schools.

### 5.2 Exercise types

| # | Type | What she does | Scored |
|---|---|---|---|
| 1 | Hear & find letter | Hears "мъ", taps М among 3–4 letters | Yes |
| 2 | Print ↔ handwritten | Sees М, taps its handwritten form (and reverse) | Yes |
| 3 | Watch it blend | М and А slide together with "мъ… а… ма" | No (demo) |
| 4 | Blend it yourself | Drags М onto А; they join; hears "ма" | Always correct |
| 5 | Hear & find syllable | Hears "ма", picks among МА / МО / АМ | Yes |
| 6 | Build the word | Picture + "мама"; drags МА + МА into order | Yes |
| 7 | Read & match | Sees ЛУНА with no sound, picks the picture from 3; sound plays after | Yes |

**Distractors** use only known letters and differ from the answer by one letter or by order, to train careful left-to-right reading. Words used in exercises 6 and 7 must be picturable nouns with an OpenMoji image; non-picturable words (НИЕ, СЪН) may appear in story stops only.

### 5.3 Lesson structure
- 5–7 minutes, 8–10 exercises: new letter intro → letter exercises → blending demo → blending practice → word exercises → review items from low review boxes.
- **Mistakes:** soft sound, prompt replays. After a second miss the correct answer is gently highlighted. Nothing is ever taken away.
- Finishing a stop unlocks the next. Any completed stop can be replayed.

## 6. Audio pipeline

**Clips:** letter sounds, syllables, words, and spoken instructions/praise ("Намери буквата", "Браво!", "Опитай пак"). A few hundred clips in total.

**Generation (`tools/generate-audio`):**
1. Derives the full clip list from `content/`.
2. Calls Azure TTS with a Bulgarian neural voice; saves MP3s and a manifest (text → file).
3. Incremental: only new or changed clips are generated.
4. Azure key in local `.env` (git-ignored). Generated audio **is committed**, so deploying and cloning need no Azure account.
5. Per-clip **pronunciation overrides** in `content/` (alternative spelling or SSML) fix bad clips.

**Review (`tools/review`):** dev-only page listing every clip with play and "flag as bad". Flagged clips get overrides, are regenerated and re-reviewed.

**Playback:**
- Preload all clips for a lesson when it starts.
- Timed sequences synced with animations (мъ → pause → а → pause → ма).
- A "Започни" (Start) button on launch unlocks audio on iOS.
- Clips are cached by the PWA service worker for offline use.

**First implementation step:** a throwaway voice test (about a dozen letter sounds and syllables) to confirm Azure's Bulgarian letter sounds are usable before building on them. Compare against a local open-source voice (e.g. MMS-TTS) if Azure falls short.

## 7. Progress, stickers, storage

### 7.1 Data per profile
- **Profile:** name, animal avatar.
- **Stops:** completed flag, play count.
- **Items** (letter sound, print↔handwritten pair, syllable, word): recent results, first-try correctness, **review box** (1–5). First-try correct → up one box; miss → back to box 1. Low-box items appear more often in reviews. An item is **known** at box ≥ 3.
- **Stickers:** collected IDs with timestamps; current sticker-meter value.
- **Schema version** for migrations.

### 7.2 Stickers
- The sticker meter fills with each first-try correct answer; every 5 gives a sticker. Misses don't fill it; nothing is removed.
- Finishing a stop always gives a sticker.
- Finishing a region gives a special large sticker.
- **Album:** one themed page per region; she drags each new sticker into its slot.

### 7.3 Storage
- `ProgressStore` interface: load/save profiles, load/save progress, export, import. IndexedDB implementation.
- Saved after every answer.
- Export/import of everything as a JSON file.
- Request persistent storage (`navigator.storage.persist()`).
- **Safari:** data may be evicted after 7 days without use unless the site is added to the Home Screen. A one-time "Add to Home Screen" prompt is shown on Apple devices; export is the backup.

### 7.4 Parent area
- Behind an adult check (e.g. hold a button for 3 seconds, or a sum like 7 + 8).
- Progress overview: stops completed, stickers, letters/syllables she struggles with (items in box 1–2 with recent misses).
- Manage profiles, reset progress, export/import.
- Shows warnings (storage unavailable, failed migration).

## 8. Error handling

The child never sees an error.

| Problem | Behaviour |
|---|---|
| Missing audio clip | Exercise runs without sound; logged in development |
| Storage unavailable | In-memory progress; parent area warns it won't be saved |
| Old saved data | Migrated by schema version; on failure, raw data kept as backup, fresh start offered, parent area explains |
| Invalid import file | Validated first; rejected with a parent-facing message; current data untouched |
| Offline | Everything served from the PWA cache |
| Content mistakes | Caught at build time by content checks (§9) |

## 9. Testing

- **Engine (Vitest):** exercise generation (distractors use only known letters and differ by one letter or order), scoring, review boxes, sticker meter, stop/region rewards.
- **Content checks (Vitest, run on every build):** each stop uses only introduced letters; syllable splits rebuild their word; every word has a picture and an audio clip; every clip in the manifest exists; case settings are consistent.
- **Storage:** export → import round-trip is identical; migrations; tests run against `fake-indexeddb`.
- **End-to-end (Playwright):** start → profile → complete a stop → sticker awarded → reload → progress persists. Tablet and phone viewports.
- **Manual:** audio review, check on her real tablet, and observing her using it.

## 10. Open items

1. **Handwritten font.** Find a free font matching Bulgarian first-grade handwriting (shapes of д, г, т etc. differ from Russian cursive). Fallback: draw the handwritten capitals and lowercase as SVGs, which would also enable tracing later.
2. **Azure voice choice and letter-sound quality.** Settled by the voice test (§6).
3. **Word list per stop.** Draft during implementation of `content/`; every word must use only known letters and be picturable with OpenMoji.
4. **Journey map art.** Start with a simple illustrated SVG path per region; refine once the app works.
