# Bulgarian Reading App — Plan 1: Playable Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A deployed, offline-capable web app in which a child picks a profile, walks the journey through regions 1–2 (letters А М О У Л Н Е И), plays lessons with all 7 exercise types and Azure-generated audio, earns stickers, and keeps progress across reloads.

**Architecture:** Static Svelte 5 + TypeScript app built with Vite. Pure-TS `content/` (data) and `engine/` (teaching logic) are unit-tested without a browser; `storage/` wraps IndexedDB behind `ProgressStore`; `audio/` plays pre-generated MP3s via Web Audio; `ui/` holds Svelte screens plus a pure-TS `LessonSession` controller. Audio is generated offline by `tools/generate-audio.ts` and committed.

**Tech Stack:** Node 22 LTS, Vite, Svelte 5 (runes), TypeScript, Vitest, Playwright, `idb`, `fake-indexeddb`, `vite-plugin-pwa`, `openmoji`, `tsx`, Azure Speech REST API.

**Spec:** `docs/superpowers/specs/2026-10-23-bulgarian-reading-app-design.md`

**Deferred to Plan 2:** regions 3–6 content, the "малки букви" stop and lowercase display, drag-to-slot sticker album, parent area, export/import, Safari "Add to Home Screen" prompt, schema migrations beyond v1.

## Global Constraints

- Node **≥ 22.12** (Vite 7 requires ≥ 20.19; this machine has 20.18.1 — upgrade before Task 2).
- Package manager: npm; commit `package-lock.json`. Use current versions at execution time.
- No backend, no runtime network calls except loading the app's own static files.
- All child-facing text is Bulgarian; instructions are spoken (audio clip) plus icons. No English visible to the child.
- Capitals only in Plan 1 (every stop has `case: 'upper'`).
- Letters are voiced by sound names: vowels as themselves, consonants with "ъ" ("мъ", "лъ").
- Pictures: OpenMoji colour SVGs only; attribution "Emoji graphics: OpenMoji – CC BY-SA 4.0" visible on the start screen.
- Azure key/region live in `.env` (`AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`), git-ignored. Generated audio in `public/audio/` **is committed**.
- The child never sees an error message; failures degrade silently (dev-only `console.warn`).
- Every tap target ≥ 64×64 CSS px; layout must fit 360×640 portrait without scrolling during a lesson.
- Every interaction the spec describes as drag also works by tapping (tap М then tap А; tap syllable tiles in order).

### Deviations from the spec (confirmed with the user before execution)
- Stop 1 introduces **two** letters (А and М) so a syllable (МА) exists from the first lesson. All other letter stops introduce one.
- Letter-recognition distractors may use any letter of the alphabet; syllable distractors use only known letters (spec §5.2 rule).
- Drag interactions get a tap alternative (see above).

## Review Focus

1. **Double/rapid taps on an answer** — must be scored once; no duplicate sticker or skipped exercise. Test: Task 9 `ignores answers while a previous answer is being handled`.
2. **Tab closed mid-lesson** — answers already given are saved; the stop is *not* marked completed; reopening starts a fresh lesson. Test: Task 9 `saves after each answer but completes the stop only on finish`.
3. **Audio missing, failed or not unlocked** — every exercise remains answerable; `play()` resolves instead of hanging. Test: Task 8 `play resolves for a missing clip`.
4. **Small phone screen (360×640)** — lesson options and tiles all visible without scrolling. Test: Task 11 e2e `phone` project asserts every option is within the viewport.
5. **Early stops with few known letters** — exercises must not crash or show one-option questions; syllable questions need ≥ 2 options, otherwise the exercise type is skipped. Test: Task 4 `first stop builds a valid lesson with only А and М known`.

---

## File Structure

```
content/
  types.ts          Letter, Word, Stop, Region, StickerDef, Phrase, ClipOverride types
  letters.ts        all 30 letters (upper, lower, soundText, isVowel)
  words.ts          words with syllable splits and OpenMoji hexcodes
  regions.ts        regions 1–2 and their stops, in journey order
  stickers.ts       sticker pool per region + region large stickers
  phrases.ts        spoken instruction/praise phrases
  overrides.ts      pronunciation overrides keyed by clip key
  clips.ts          clip key helpers + allClips()
  index.ts          `content` bundle object
  content.test.ts   content checks
engine/
  rng.ts            Rng type, mulberry32, pick, shuffle
  known.ts          knownLettersThrough, syllablesForStop
  exercises.ts      Exercise union, itemIdFor, correctAnswer
  distractors.ts    letterOptions, syllableOptions
  lesson.ts         buildLesson
  progress.ts       Progress/Profile types, emptyProgress, recordAnswer, completeStop
  journey.ts        stopStatus
  *.test.ts
storage/
  store.ts          ProgressStore interface, MemoryStore, openStore
  idb-store.ts      IdbStore
  store.test.ts
audio/
  player.ts         AudioPlayer
  player.test.ts
ui/
  lesson/session.ts LessonSession controller (+ session.test.ts)
  App.svelte, screens/*.svelte, exercises/*.svelte, components/*.svelte
tools/
  audio-config.ts   VOICE constant
  generate-audio.ts
  copy-pictures.ts
review.html, tools/review/main.ts   dev-only audio review page
e2e/lesson.spec.ts
```

---

### Task 1: Spike — voice and handwriting font (throwaway, user decides)

**Output is a decision, not code.** Nothing from `spike/` is kept.

**Files:**
- Create (throwaway, git-ignored): `spike/voice-test.mjs`, `spike/out/*.mp3`, `spike/fonts.html`
- Create (kept): `docs/decisions.md`

- [ ] **Step 1: Get Azure credentials from the user.** Ask the user to create a free Azure Speech resource (F0 tier) and put `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` in `/home/sve/projects/reading-app/.env`. Add `.env` and `spike/` to `.gitignore`.
- [ ] **Step 2: Confirm the Bulgarian voice list.** `GET https://<region>.tts.speech.microsoft.com/cognitiveservices/voices/list` with header `Ocp-Apim-Subscription-Key`; filter `Locale === 'bg-BG'`. Record the voice short names.
- [ ] **Step 3: Generate samples** for each bg-BG voice with `spike/voice-test.mjs` (plain `fetch`, same request format as Task 7 Step 3) for these texts: `а`, `о`, `у`, `мъ`, `лъ`, `нъ`, `ма`, `мо`, `му`, `ам`, `лу`, `на`, `мама`, `луна`, `Намери буквата`, `Браво!`. Output `spike/out/<voice>-<text>.mp3`.
- [ ] **Step 4: Build `spike/fonts.html`** showing the capitals А Б В Г Д Е Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ь Ю Я and lowercase in each candidate handwritten font that supports Cyrillic. Search for free (OFL or similar) fonts that imitate Bulgarian school handwriting. Include Google Fonts candidates and any Bulgarian school-script fonts found, and note each one's licence.
- [ ] **Step 5: User review.** The user listens to the samples and looks at the font page. They pick: the voice; whether letter sounds are acceptable (if not, try overrides like `мъ` → `м` / SSML `<prosody rate="-20%">` and re-listen); and the font, or "none good enough" → SVG letters become a Plan 2 task and Plan 1 uses the best available font.
- [ ] **Step 6: Record decisions** in `docs/decisions.md`: chosen voice short name, any overrides found during the test, chosen font name + licence + source URL.
- [ ] **Step 7: Commit**

```bash
git add .gitignore docs/decisions.md
git commit -m "docs: record voice and handwriting font decisions"
```

---

### Task 2: Project scaffold, content model, regions 1–2 content, content checks

**Files:**
- Create: project scaffold (`package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.ts` → mount `ui/App.svelte`), `vitest.config.ts`
- Create: `content/types.ts`, `letters.ts`, `words.ts`, `regions.ts`, `stickers.ts`, `phrases.ts`, `overrides.ts`, `index.ts`
- Test: `content/content.test.ts`

**Interfaces:**
- Produces:
```ts
type LetterId = string; // the capital, e.g. 'М'
interface Letter { id: LetterId; upper: string; lower: string; soundText: string; isVowel: boolean }
interface Word { text: string; syllables: string[]; picture?: string } // text in capitals; picture = OpenMoji hexcode
type StopKind = 'letter' | 'story';
interface Stop { id: string; regionId: string; kind: StopKind; newLetters: LetterId[]; case: 'upper' | 'mixed'; words: string[] }
interface Region { id: string; name: string; stops: Stop[] }
interface StickerDef { id: string; regionId: string; picture: string; large: boolean }
interface Phrase { id: PhraseId; text: string }
type PhraseId = 'find-letter' | 'match-hand' | 'watch-blend' | 'drag-blend' | 'find-syllable' | 'build-word' | 'read-word' | 'bravo' | 'try-again' | 'sticker';
interface ClipOverride { text?: string; ssml?: string }
interface Content { letters: Letter[]; words: Word[]; regions: Region[]; stickers: StickerDef[]; phrases: Phrase[]; overrides: Record<string, ClipOverride> }
export const content: Content; // content/index.ts
export function allStops(c: Content): Stop[]; // journey order
```

- [ ] **Step 1: Upgrade Node** to 22 LTS (e.g. `nvm install 22 && nvm use 22`; ask the user if nvm is not installed). Verify `node --version` ≥ v22.12.
- [ ] **Step 2: Scaffold** with `npm create vite@latest . -- --template svelte-ts`, then `npm i -D vitest tsx openmoji @playwright/test fake-indexeddb` and `npm i idb`. Move the template's `src/App.svelte` to `ui/App.svelte` (placeholder "Чета"). Add scripts: `"test": "vitest run"`, `"e2e": "playwright test"`. Set `<html lang="bg">` in `index.html`.
- [ ] **Step 3: Write content data.**
  - `letters.ts`: all 30 letters. `soundText`: vowels А Е И О У Ъ Ю Я → lowercase letter; Й → `и кратко`; Ь → `ер малък`; other consonants → lowercase + `ъ` (`бъ`, `мъ`, `щъ`).
  - `regions.ts`: `r1` "Поляна": `r1-s1` newLetters `['А','М']`, `r1-s2` `['О']`, `r1-s3` `['У']`, `r1-story`. `r2` "Гора": `r2-s1` `['Л']`, `r2-s2` `['Н']`, `r2-s3` `['Е']`, `r2-s4` `['И']`, `r2-story`. All `case: 'upper'`. Each letter stop lists 1–3 words using only known letters; story stops list 3–5.
  - `words.ts`: at least МАМА (МА-МА), ЛУНА (ЛУ-НА), ЛАМА (ЛА-МА), ЛИМОН (ЛИ-МОН), plus enough picturable words to give each region-2 stop ≥ 1 word. Every word in a letter stop has a `picture`.
  - `stickers.ts`: ≥ 8 normal stickers per region (themed: flowers/insects for r1, forest animals for r2) and 1 `large: true` per region.
  - `phrases.ts`: `find-letter` "Намери буквата", `match-hand` "Намери същата буква", `watch-blend` "Слушай как буквите се събират", `drag-blend` "Събери буквите", `find-syllable` "Намери сричката", `build-word` "Подреди думата", `read-word` "Прочети думата и намери картинката", `bravo` "Браво!", `try-again` "Опитай пак", `sticker` "Спечели стикер!".
  - `overrides.ts`: entries recorded in `docs/decisions.md`, else `{}`.
- [ ] **Step 4: Write the failing content checks** in `content/content.test.ts`:

```ts
test('each stop uses only letters introduced by then', ...)        // every char of every word ∈ known letters through that stop
test('syllable splits rebuild their word', ...)                    // w.syllables.join('') === w.text
test('every word referenced by a stop exists in words.ts', ...)
test('words in letter stops have a picture', ...)
test('every picture exists in openmoji', ...)                      // fs.existsSync(`node_modules/openmoji/color/svg/${hex}.svg`)
test('no letter is introduced twice; letter stops introduce ≥1, story stops 0', ...)
test('every sticker picture exists in openmoji and each region has exactly one large sticker', ...)
test('all Plan 1 stops are upper case', ...)
```

- [ ] **Step 5: Run** `npx vitest run content` — fails until data and `allStops` exist; fix data/helpers until all pass.
- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: scaffold app and add regions 1–2 content with checks"
```

---

### Task 3: Engine — randomness, known letters, syllables, distractors

**Files:**
- Create: `engine/rng.ts`, `engine/known.ts`, `engine/distractors.ts`
- Test: `engine/known.test.ts`, `engine/distractors.test.ts`

**Interfaces:**
- Consumes: `Content`, `Stop`, `LetterId` (Task 2)
- Produces:
```ts
type Rng = () => number;                              // [0,1)
function mulberry32(seed: number): Rng;
function pick<T>(rng: Rng, xs: readonly T[]): T;
function shuffle<T>(rng: Rng, xs: readonly T[]): T[]; // new array
function knownLettersThrough(c: Content, stopId: string): LetterId[]; // includes the stop's own newLetters
function syllablesForStop(c: Content, stopId: string): string[];
function letterOptions(rng: Rng, c: Content, answer: LetterId, count: number): LetterId[]; // includes answer, shuffled
function syllableOptions(rng: Rng, answer: string, known: LetterId[], max: number): string[]; // includes answer; may return 1 if no distractor exists
```

`syllablesForStop`: all 2-letter syllables consonant+vowel and vowel+consonant built from known letters, where at least one letter is among the stop's `newLetters`. Story stops return syllables of their words.

`syllableOptions` candidates, in priority order: the reversed syllable (МА → АМ), then same-length strings differing from the answer in exactly one position with a known letter that keeps the consonant/vowel pattern. Deduplicate, exclude the answer, shuffle, take `max - 1`.

- [ ] **Step 1: Write failing tests**

```ts
test('mulberry32 is deterministic', () => expect(mulberry32(1)()).toBe(mulberry32(1)()));
test('knownLettersThrough r1-s2 is А М О', () => expect(new Set(knownLettersThrough(content, 'r1-s2'))).toEqual(new Set(['А','М','О'])));
test('syllablesForStop r1-s1 is МА and АМ', () => expect(new Set(syllablesForStop(content, 'r1-s1'))).toEqual(new Set(['МА','АМ'])));
test('syllablesForStop r1-s2 contains МО and ОМ but not МА', ...);
test('letterOptions returns count distinct letters including the answer', ...);
test('syllableOptions only uses known letters and differs by one letter or order', ...); // for 'МА' with А М О У
test('syllableOptions for МА with only А М returns МА and АМ', ...);
```

- [ ] **Step 2: Run** `npx vitest run engine` — expect FAIL (modules missing).
- [ ] **Step 3: Implement** the functions above.
- [ ] **Step 4: Run** `npx vitest run engine` — expect PASS.
- [ ] **Step 5: Commit** `git add engine && git commit -m "feat(engine): rng, known letters, syllables, distractors"`

---

### Task 4: Engine — exercises and lesson builder

**Files:**
- Create: `engine/exercises.ts`, `engine/lesson.ts`, `engine/progress.ts` (types + `emptyProgress` only)
- Test: `engine/lesson.test.ts`

**Interfaces:**
- Consumes: Task 3 functions.
- Produces (`engine/progress.ts`, functions added in Task 5):
```ts
type ItemId = string; // 'sound:М' | 'hand:М' | 'syl:МА' | 'word:МАМА'
interface ItemState { box: 1|2|3|4|5; recent: boolean[]; lastSeen: number } // recent: last 5 first-try results, newest last
interface Progress { schemaVersion: 1; profileId: string; stops: Record<string, { completed: boolean; plays: number }>; items: Record<ItemId, ItemState>; stickers: { id: string; at: number }[]; meter: number }
function emptyProgress(profileId: string): Progress;
```
- Produces (`engine/exercises.ts`, `engine/lesson.ts`):
```ts
type Exercise =
  | { kind: 'hear-letter'; letter: LetterId; options: LetterId[] }
  | { kind: 'print-hand'; letter: LetterId; direction: 'print-to-hand' | 'hand-to-print'; options: LetterId[] }
  | { kind: 'watch-blend'; syllable: string }
  | { kind: 'blend'; syllable: string }
  | { kind: 'hear-syllable'; syllable: string; options: string[] }
  | { kind: 'build-word'; word: string; tiles: string[] }          // shuffled syllables
  | { kind: 'read-match'; word: string; options: string[] };       // words, shown as pictures
function isScored(ex: Exercise): boolean;      // false for watch-blend and blend
function itemIdFor(ex: Exercise): ItemId | null; // hear-letter→sound:, print-hand→hand:, hear-syllable/blend→syl:, build-word/read-match→word:, watch-blend→null
function correctAnswer(ex: Exercise): string;  // letter id, syllable, or word text; build-word → syllables joined with '-'
function buildLesson(c: Content, stopId: string, progress: Progress, rng: Rng): Exercise[];
```

**Lesson composition for a letter stop, in order:**
1. For each new letter: `hear-letter` (4 options), `print-hand` (3 options, direction random).
2. `watch-blend` then `blend` on one syllable from `syllablesForStop` containing a new letter.
3. `hear-syllable` ×2 (different syllables if possible, `max` 3 options) — skipped when `syllableOptions` returns < 2 options.
4. `build-word` on one stop word (only if the word has ≥ 2 syllables), `read-match` on one stop word (3 options; distractors are other words with pictures from the whole content).
5. Review: up to 2 items from `progress.items` with `box ≤ 2` whose letters are all known, turned back into the matching exercise type, least recently seen first.
6. Pad with extra `hear-syllable` up to 8 exercises; truncate review items so the total is ≤ 10.

**Story stop:** `read-match` and `build-word` for each word with a picture, then review, total ≤ 10.

- [ ] **Step 1: Write failing tests**

```ts
test('first stop builds a valid lesson with only А and М known', () => {
  const ex = buildLesson(content, 'r1-s1', emptyProgress('p'), mulberry32(1));
  expect(ex.length).toBeGreaterThanOrEqual(8); expect(ex.length).toBeLessThanOrEqual(10);
  for (const e of ex) if ('options' in e) { expect(e.options.length).toBeGreaterThanOrEqual(2); expect(e.options).toContain(correctAnswer(e)); }
});
test('lesson starts with hear-letter for each new letter', ...);
test('watch-blend is immediately followed by blend on the same syllable', ...);
test('syllable options only contain known letters', ...);       // all stops
test('build-word tiles are a permutation of the word syllables', ...);
test('review includes a box-1 item from an earlier stop', ...); // progress with items['syl:МА'] = { box: 1, ... } → r1-s2 lesson contains hear-syllable МА
test('story stop contains read-match for each pictured word', ...);
test('itemIdFor and isScored map every exercise kind', ...);
```

- [ ] **Step 2: Run** `npx vitest run engine/lesson` — expect FAIL.
- [ ] **Step 3: Implement** `progress.ts` (types + `emptyProgress`), `exercises.ts` and `lesson.ts`.
- [ ] **Step 4: Run** `npx vitest run engine` — expect PASS.
- [ ] **Step 5: Commit** `git add engine && git commit -m "feat(engine): exercise types and lesson builder"`

---

### Task 5: Engine — answers, review boxes, stickers, journey status

**Files:**
- Modify: `engine/progress.ts`
- Create: `engine/journey.ts`
- Test: `engine/progress.test.ts`, `engine/journey.test.ts`

**Interfaces:**
- Consumes: `Progress`, `ItemId`, `emptyProgress` (Task 4); `Content`, `allStops` (Task 2)
- Produces:
```ts
const METER_SIZE = 5;
function recordAnswer(c: Content, p: Progress, item: ItemId, firstTry: boolean, regionId: string, now: number): { progress: Progress; sticker: string | null };
function completeStop(c: Content, p: Progress, stopId: string, now: number): { progress: Progress; stickers: string[] };
function stopStatus(c: Content, p: Progress, stopId: string): 'locked' | 'open' | 'done';
function knownItems(p: Progress): ItemId[]; // box ≥ 3
```
All functions are pure (return new objects).

Rules (spec §7): `firstTry` true → box +1 (max 5), meter +1; false → box 1, meter unchanged. New items start at box 1 before applying the answer. `recent` keeps the last 5. Meter reaching `METER_SIZE` → reset to 0 and award the next uncollected normal sticker of `regionId` in content order; if the region pool is exhausted, the next uncollected normal sticker of any region; if none, `null`. `completeStop`: `plays +1`, `completed = true`, always one normal sticker (same selection); if this completion makes every stop of the region completed for the first time, also the region's large sticker. `stopStatus`: first stop overall `open`; otherwise `open` if the previous stop in journey order is completed; `done` if completed.

- [ ] **Step 1: Write failing tests**

```ts
test('first-try correct moves box up and fills meter', ...);   // box 1→2, meter 0→1
test('miss resets box to 1 and leaves meter', ...);
test('box never exceeds 5', ...);
test('5th first-try correct awards a region sticker and resets meter', ...);
test('stickers are not awarded twice while uncollected ones remain', ...);
test('completeStop always awards one sticker', ...);
test('completing the last stop of a region also awards the large sticker once', ...); // replaying it later does not
test('stopStatus: r1-s1 open, r1-s2 locked until r1-s1 completed', ...);
test('recordAnswer does not mutate its input', ...);
```

- [ ] **Step 2: Run** `npx vitest run engine/progress engine/journey` — expect FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npx vitest run engine` — expect PASS.
- [ ] **Step 5: Commit** `git add engine && git commit -m "feat(engine): answers, review boxes, stickers, journey status"`

---

### Task 6: Storage

**Files:**
- Create: `storage/store.ts`, `storage/idb-store.ts`
- Test: `storage/store.test.ts`

**Interfaces:**
- Consumes: `Progress`, `emptyProgress` (Task 4)
- Produces:
```ts
interface Profile { id: string; name: string; avatar: string } // avatar = OpenMoji hexcode
interface ProgressStore {
  listProfiles(): Promise<Profile[]>;
  saveProfile(p: Profile): Promise<void>;
  loadProgress(profileId: string): Promise<Progress>;   // emptyProgress if none
  saveProgress(p: Progress): Promise<void>;
}
class MemoryStore implements ProgressStore {}
class IdbStore implements ProgressStore { static open(): Promise<IdbStore> }
function openStore(): Promise<{ store: ProgressStore; persistent: boolean }>;
```

IndexedDB via `idb`: database `reading-app`, version 1, stores `profiles` (keyPath `id`), `progress` (keyPath `profileId`), `backups` (autoIncrement). `loadProgress`: if a stored record's `schemaVersion !== 1`, put the raw record into `backups` and return `emptyProgress`. `openStore`: try `IdbStore.open()`, on any error return `MemoryStore` with `persistent: false`; on success call `navigator.storage?.persist?.()` and return `persistent: true`.

- [ ] **Step 1: Write failing tests** (import `fake-indexeddb/auto`; run each test against both stores where applicable)

```ts
test('saveProfile then listProfiles returns it', ...);
test('loadProgress for an unknown profile returns emptyProgress', ...);
test('saveProgress then loadProgress round-trips identically', ...);
test('unknown schemaVersion is backed up and replaced by empty progress', ...);
test('openStore falls back to MemoryStore when indexedDB.open throws', ...);
```

- [ ] **Step 2: Run** `npx vitest run storage` — expect FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npx vitest run storage` — expect PASS.
- [ ] **Step 5: Commit** `git add storage && git commit -m "feat(storage): IndexedDB progress store with memory fallback"`

---

### Task 7: Clips, audio generation, pictures, review page

**Files:**
- Create: `content/clips.ts`, `tools/audio-config.ts`, `tools/generate-audio.ts`, `tools/copy-pictures.ts`, `ui/avatars.ts`, `review.html`, `tools/review/main.ts`
- Create (generated, committed): `public/audio/*.mp3`, `public/audio/manifest.json`
- Modify: `content/content.test.ts`, `package.json` (scripts), `.gitignore` (`public/pictures/`)

**Interfaces:**
- Consumes: `content`, `allStops`, `syllablesForStop`
- Produces:
```ts
interface ClipSpec { key: string; text: string; ssml?: string }
const clipKey: { letter(id: LetterId): string; syllable(s: string): string; word(w: string): string; phrase(id: PhraseId): string };
// → 'letter:М', 'syl:МА', 'word:МАМА', 'say:bravo'
function allClips(c: Content): ClipSpec[]; // letters of all stops (soundText), syllables of all stops, all stop words, all phrases; text lowercased for syllables/words; overrides applied; deduplicated by key
type Manifest = Record<string, string>;   // key → file name, served at `${import.meta.env.BASE_URL}audio/${file}`
const AVATARS: string[];                  // ui/avatars.ts: 8 OpenMoji animal hexcodes
```

- [ ] **Step 1: Add the failing content check**

```ts
test('every clip has a manifest entry and the file exists', ...); // reads public/audio/manifest.json
```

- [ ] **Step 2: Implement `content/clips.ts`** and `tools/audio-config.ts` (`export const VOICE = '<from docs/decisions.md>'`).
- [ ] **Step 3: Implement `tools/generate-audio.ts`** (run with `tsx`; `npm run audio`):
  - Load `.env` (`process.loadEnvFile`).
  - For each `ClipSpec`: file name = first 16 hex chars of `sha1(VOICE + '|' + (ssml ?? text))` + `.mp3`. Skip if it already exists.
  - Request: `POST https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, headers `Ocp-Apim-Subscription-Key`, `Content-Type: application/ssml+xml`, `X-Microsoft-OutputFormat: audio-24khz-48kbitrate-mono-mp3`, `User-Agent: reading-app`. Body `<speak version="1.0" xml:lang="bg-BG"><voice name="${VOICE}">${ssml ?? xmlEscape(text)}</voice></speak>`.
  - Sequential requests, ≥ 3.1 s apart (F0 limit 20/min). On 429, wait `Retry-After` (default 10 s) and retry, max 5 times. Any other non-2xx → print key + status and exit non-zero after writing the manifest for what succeeded.
  - Write `public/audio/manifest.json` (sorted keys); delete `.mp3` files in `public/audio/` not referenced by it.
- [ ] **Step 4: Implement `tools/copy-pictures.ts`**: copy every word picture, sticker picture and `AVATARS` hexcode from `node_modules/openmoji/color/svg/` to `public/pictures/`. Scripts: `"pictures": "tsx tools/copy-pictures.ts"`, `"predev"` and `"prebuild"` run it.
- [ ] **Step 5: Run** `npm run audio` (the user must have `.env` in place). Expect ~200–400 clips generated; re-running generates 0.
- [ ] **Step 6: Run** `npx vitest run content` — expect PASS.
- [ ] **Step 7: Implement the review page**: `review.html` + `tools/review/main.ts` (plain TS, no Svelte) lists every clip grouped by type: key, text, ▶ play button, "лошо" checkbox stored in `localStorage`, and a "Copy flagged keys" button. Served by `npm run dev` at `/review.html`; not part of the production build (Vite builds only `index.html`).
- [ ] **Step 8: User review gate.** The user opens `/review.html`, listens to every clip, and pastes the flagged keys. For each: add an entry to `content/overrides.ts`, re-run `npm run audio`, and have the user re-check those keys. Repeat until none are flagged.
- [ ] **Step 9: Commit**

```bash
git add content tools review.html public/audio package.json .gitignore ui/avatars.ts
git commit -m "feat(audio): clip list, Azure generation, review page, pictures"
```

---

### Task 8: Audio player

**Files:**
- Create: `audio/player.ts`
- Test: `audio/player.test.ts`

**Interfaces:**
- Consumes: `Manifest` (Task 7)
- Produces:
```ts
type Step = { clip: string } | { pause: number }; // pause in ms
class AudioPlayer {
  constructor(manifest: Manifest, baseUrl: string, deps?: { ctx?: AudioContext; fetch?: typeof fetch });
  static load(baseUrl: string): Promise<AudioPlayer>;  // fetches manifest.json; on failure → empty manifest
  unlock(): Promise<void>;          // ctx.resume(); call from the Start button tap
  preload(keys: string[]): Promise<void>; // fetch + decodeAudioData into a cache; failures ignored
  play(key: string): Promise<void>;       // resolves when the clip ends; resolves immediately if missing/undecodable
  playSequence(steps: Step[]): Promise<void>;
  stop(): void;                           // stop current sound; pending play/playSequence promises resolve
}
```

Uses Web Audio (`AudioBufferSourceNode`) for precise timing. Missing or failed clips: `console.warn` only when `import.meta.env.DEV`. Starting a new `play` stops the current one.

- [ ] **Step 1: Write failing tests** with a fake `AudioContext` (`decodeAudioData` returns `{ duration }`, `createBufferSource` returns a node whose `start()` schedules `onended` via `setTimeout(duration)`) and fake `fetch`; use Vitest fake timers.

```ts
test('play resolves for a missing clip', ...);
test('play resolves when the clip ends', ...);
test('playSequence plays clips in order with pauses', ...); // record start order + timestamps
test('stop resolves pending playSequence', ...);
test('load with failing manifest fetch gives a player whose play resolves', ...);
```

- [ ] **Step 2: Run** `npx vitest run audio` — expect FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npx vitest run audio` — expect PASS.
- [ ] **Step 5: Commit** `git add audio && git commit -m "feat(audio): Web Audio player with preload and sequences"`

---

### Task 9: Lesson session controller

**Files:**
- Create: `ui/lesson/session.ts`
- Test: `ui/lesson/session.test.ts`

**Interfaces:**
- Consumes: `Exercise`, `isScored`, `itemIdFor`, `correctAnswer`, `recordAnswer`, `completeStop`, `Progress`, `Content`
- Produces:
```ts
type AnswerResult = 'correct' | 'wrong' | 'reveal' | 'ignored';
class LessonSession {
  constructor(c: Content, stopId: string, exercises: Exercise[], progress: Progress,
              deps: { save(p: Progress): Promise<void>; now(): number; onSticker(id: string): void });
  readonly total: number;
  get index(): number;
  get current(): Exercise | null;   // null when all done
  get progress(): Progress;
  get meter(): number;
  answer(choice: string): Promise<AnswerResult>; // scored exercises only
  next(): Promise<void>;                          // advance; for unscored exercises and after 'correct'
  finish(): Promise<string[]>;                    // completeStop + save; returns stickers
}
```

Behaviour: 1st wrong → `'wrong'`; 2nd wrong → `'reveal'` (the UI highlights the answer; the next `answer` with the correct choice returns `'correct'` but counts as not first try). `firstTry` = the correct choice was given with no earlier wrong answer on this exercise. `recordAnswer` runs once per exercise, when the correct answer is finally given. After `'correct'`, further `answer` calls return `'ignored'` until `next()`. While a `save` is pending, `answer` returns `'ignored'`. `save` runs after every recorded answer; `completeStop` runs only in `finish`. Stickers from `recordAnswer` and `finish` go to `onSticker`.

- [ ] **Step 1: Write failing tests**

```ts
test('correct first try records firstTry=true and saves', ...);
test('wrong then correct records firstTry=false', ...);
test('second wrong returns reveal', ...);
test('ignores answers while a previous answer is being handled', ...); // save returns a pending promise; second answer → 'ignored'; recordAnswer effect applied once
test('saves after each answer but completes the stop only on finish', ...); // after 3 answers: saved progress has items, stops[stopId] undefined
test('finish awards the stop sticker via onSticker', ...);
test('unscored exercises advance with next() and record nothing', ...);
```

- [ ] **Step 2: Run** `npx vitest run ui/lesson` — expect FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npx vitest run` — expect all PASS.
- [ ] **Step 5: Commit** `git add ui/lesson && git commit -m "feat: lesson session controller"`

---

### Task 10: UI shell — start, profiles, journey map, sticker album

**Files:**
- Create: `ui/App.svelte` (replace placeholder), `ui/screens/Start.svelte`, `ui/screens/Profiles.svelte`, `ui/screens/Journey.svelte`, `ui/screens/Album.svelte`, `ui/components/Picture.svelte`, `ui/theme.css`
- Test: `e2e/shell.spec.ts`, `playwright.config.ts`

**Interfaces:**
- Consumes: `openStore`, `ProgressStore`, `Profile`, `AudioPlayer.load/unlock`, `stopStatus`, `allStops`, `content`, `AVATARS`
- Produces: `App.svelte` holds `screen: { name: 'start' } | { name: 'profiles' } | { name: 'journey' } | { name: 'album' } | { name: 'lesson'; stopId: string }` plus `store`, `player`, `profile`, `progress` in `$state`. Task 11 adds the `Lesson` screen into this switch.

- **Start:** big "Започни" button (calls `player.unlock()`) and the OpenMoji attribution line.
- **Profiles:** existing profiles as large avatar + name buttons; "+" opens create: name input (1–20 chars, trimmed; any script) and a grid of the 8 avatars.
- **Journey:** one SVG per region, stops as circles along a curved path, region name as heading; states locked (grey, lock icon, not tappable), open (pulsing), done (✓). Tapping an open/done stop → lesson. A sticker-album button in the corner. Scrolls vertically.
- **Album:** grid of the profile's stickers per region; uncollected slots shown as outlines.
- Handwritten font from `docs/decisions.md` as `--font-hand` in `theme.css`; print font a clear sans with Bulgarian Cyrillic glyphs, `--font-print`.

- [ ] **Step 1: Configure Playwright**: `webServer: { command: 'VITE_E2E=1 npm run build && npm run preview -- --port 4173', port: 4173 }`, projects `tablet` (768×1024, `hasTouch`) and `phone` (360×640, `hasTouch`).
- [ ] **Step 2: Write the failing e2e test** `e2e/shell.spec.ts`:

```ts
test('start → create profile → journey shows r1-s1 open and r1-s2 locked', ...);
test('profile and journey survive reload', ...);        // reload → profiles screen lists the created profile
test('locked stop does not open a lesson', ...);
```

- [ ] **Step 3: Run** `npx playwright install chromium && npm run e2e -- e2e/shell.spec.ts` — expect FAIL.
- [ ] **Step 4: Implement** the screens. Add `data-testid` attributes (`stop-r1-s1`, `profile-new`, …) used by the tests.
- [ ] **Step 5: Run** `npm run e2e -- e2e/shell.spec.ts` — expect PASS on both projects.
- [ ] **Step 6: Commit** `git add -A && git commit -m "feat(ui): start, profiles, journey map, sticker album"`

---

### Task 11: UI — lesson screen and the 7 exercises

**Files:**
- Create: `ui/screens/Lesson.svelte`, `ui/exercises/HearLetter.svelte`, `PrintHand.svelte`, `WatchBlend.svelte`, `Blend.svelte`, `HearSyllable.svelte`, `BuildWord.svelte`, `ReadMatch.svelte`, `ui/components/StickerPopup.svelte`, `ui/components/Meter.svelte`, `ui/prompts.ts`
- Modify: `ui/App.svelte`
- Test: `e2e/lesson.spec.ts`

**Interfaces:**
- Consumes: `LessonSession`, `buildLesson`, `AudioPlayer`, `Step`, `clipKey`, `correctAnswer`, `METER_SIZE`
- Produces: `promptSteps(ex: Exercise): Step[]` in `ui/prompts.ts`. Each exercise component takes `{ exercise, session, player }` props and an `ondone` callback prop.

**Prompts (`promptSteps`):**
| Exercise | Steps |
|---|---|
| hear-letter | `say:find-letter`, pause 300, `letter:X` |
| print-hand | `say:match-hand` |
| watch-blend | `say:watch-blend`, pause 400, `letter:C`, pause 600, `letter:V`, pause 600, `syl:CV` (letters slide together during the last pause) |
| blend | `say:drag-blend`; after joining: `syl:CV` |
| hear-syllable | `say:find-syllable`, pause 300, `syl:X` |
| build-word | `say:build-word`, pause 300, `word:X` |
| read-match | `say:read-word` (word audio only after answering) |

**Feedback:** `correct` → `say:bravo`, green pulse, `next()` after the clip. `wrong` → `say:try-again`, gentle shake, replay the prompt. `reveal` → correct option gets class `reveal` (glow). Sticker earned → `StickerPopup` with `say:sticker`. A 🔊 button replays the prompt. When `current` is null → `finish()`, show the stickers, then return to the journey.

**Lesson layout:** top bar with ✕ (back to journey, no confirmation needed since progress is saved), progress dots, and `Meter` (`METER_SIZE` slots). The exercise fills the rest; options in a grid sized to fit 360×640.

**E2E hook:** when `import.meta.env.VITE_E2E === '1'`, the exercise root gets `data-answer={correctAnswer(ex)}` and `data-kind={ex.kind}`; options carry `data-option={value}`.

- [ ] **Step 1: Write the failing e2e test** `e2e/lesson.spec.ts` — a helper `solve(page)` loops: read `data-kind`/`data-answer`; for unscored kinds press "next"/tap the letters; for build-word tap tiles in answer order; otherwise tap `[data-option="<answer>"]`.

```ts
test('complete r1-s1 → sticker shown → r1-s2 unlocked', ...);
test('progress survives reload mid-lesson', ...);   // answer 3, reload → r1-s1 still open (not done), r1-s2 still locked, sticker meter shows 3 when reopening a lesson
test('wrong answer twice reveals the correct option', ...); // tap a wrong data-option twice → correct option has class "reveal"
test('all options are within the viewport', ...);   // for each exercise in r1-s1: every [data-option] boundingBox inside viewport (runs on phone + tablet)
```

- [ ] **Step 2: Run** `npm run e2e -- e2e/lesson.spec.ts` — expect FAIL.
- [ ] **Step 3: Implement** `prompts.ts`, the exercises, `Lesson.svelte`, and wire `{ name: 'lesson' }` into `App.svelte`. `Lesson` preloads the clips for all its exercises before showing the first one.
- [ ] **Step 4: Run** `npm test && npm run e2e` — expect all PASS.
- [ ] **Step 5: Manual check** with `npm run dev` on a desktop browser with sound: play r1-s1 fully; the blend animation and audio line up.
- [ ] **Step 6: Commit** `git add -A && git commit -m "feat(ui): lesson screen and all exercise types"`

---

### Task 12: PWA, offline, deploy

**Files:**
- Modify: `vite.config.ts`, `package.json`
- Create: `public/icon.svg`, `public/icon-192.png`, `public/icon-512.png`, `.github/workflows/deploy.yml`, `README.md`
- Test: `e2e/offline.spec.ts`

- [ ] **Step 1: Write the failing e2e test**

```ts
test('app loads and plays a lesson offline after first visit', async ({ page, context }) => {
  // visit, wait for navigator.serviceWorker.ready, context.setOffline(true), reload,
  // start → profile → open r1-s1 → first exercise visible
});
```

- [ ] **Step 2: Run** `npm run e2e -- e2e/offline.spec.ts` — expect FAIL.
- [ ] **Step 3: Add `vite-plugin-pwa`** (`npm i -D vite-plugin-pwa`): `registerType: 'autoUpdate'`, workbox `globPatterns: ['**/*.{js,css,html,svg,png,mp3,json,woff2}']`, `maximumFileSizeToCacheInBytes` ≥ 5 MB. Manifest: `name: 'Чета'`, `short_name: 'Чета'`, `lang: 'bg'`, `display: 'standalone'`, `orientation: 'any'`, the icons. Set Vite `base` from `process.env.BASE_PATH ?? '/'`.
- [ ] **Step 4: Run** `npm run e2e` — expect all PASS.
- [ ] **Step 5: Add `.github/workflows/deploy.yml`** (GitHub Pages via `actions/deploy-pages`; Node 22; `npm ci && npm test && BASE_PATH=/${{ github.event.repository.name }}/ npm run build`) and a `README.md` covering setup, `.env`, `npm run audio`, `/review.html`, and deploying.
- [ ] **Step 6: Commit** `git add -A && git commit -m "feat: PWA offline support and GitHub Pages deploy"`
- [ ] **Step 7: Deploy (user gate).** Ask the user whether to create a GitHub repository (public or private; Pages on private repos needs a paid plan) or use Netlify/Cloudflare instead. Only after they choose: create the repo, push, enable Pages (Source: GitHub Actions), and give them the URL to test on the tablet.
