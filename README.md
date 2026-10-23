# Чета

A web app that teaches a young child to read Bulgarian: letters (print and handwritten), then blending them into syllables and words. It runs in any browser, installs to the home screen, and works offline after the first visit. There is no backend; progress is saved in the browser on each device.

Design: `docs/superpowers/specs/2026-10-23-bulgarian-reading-app-design.md`

## Setup

Requires Node 22 (`nvm use` reads `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173
```

## Tests

```bash
npm test           # unit tests (engine, content checks, storage, audio, lesson controller)
npm run e2e        # browser tests at tablet and phone sizes (first time: npx playwright install chromium)
npm run check      # type check
```

## Audio

All speech is generated once with Microsoft Edge's Bulgarian read-aloud voices (via [`msedge-tts`](https://github.com/Migushthe2nd/MsEdgeTTS), no account needed) and committed under `public/audio/`, so the app itself needs no network. `msedge-tts` is an unofficial client of the Edge service; if it stops working, the committed clips keep the app working and only regenerating is affected.

1. `npm run audio` generates any new or changed clips.
2. `npm run dev` and open `/review.html` to listen to every clip. Tick "лошо" on bad ones, copy the flagged keys, add fixes to `content/overrides.ts` (a different spelling, or a slower `rate` such as `'-25%'`), and run `npm run audio` again.

The voice is set in `tools/audio-config.ts`.

## Content

What she learns lives in `content/`: letters, regions and stops in journey order, words with syllable splits and pictures, stickers, and spoken phrases. `npm test` checks the content (each stop only uses letters already taught, every word has a picture, and so on).

Pictures are [OpenMoji](https://openmoji.org) – CC BY-SA 4.0.

## Deploy

Pushing to `main` on GitHub builds and publishes to GitHub Pages (`.github/workflows/deploy.yml`). In the repository settings, set Pages → Source to "GitHub Actions".
