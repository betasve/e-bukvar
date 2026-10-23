# Decisions

## Handwriting font — Lobster (2026-10-23)

- **Font:** Lobster by Pablo Impallari, SIL Open Font License 1.1. Bundled offline via `@fontsource/lobster`; used as `--font-hand` in `ui/theme.css`.
- **Why:** the user found it on nachalen-uchitel.blogspot.com and preferred it over Bad Script, Marck Script, Caveat, Comforter and Great Vibes. It is bold and easy to read at large sizes.
- **Bulgarian forms:** the font has a Bulgarian `locl` feature (Ф, ж, к, ю), applied automatically because the page is `lang="bg"`. Other letters use the default Cyrillic shapes.
- **Caveat:** a display script, heavier and more slanted than first-grade ръкописни letters. Revisit (or draw SVG letters) if her school's shapes differ too much once lowercase arrives in Plan 2.

## Audio source — Edge read-aloud voices via msedge-tts (2026-10-23)

- Azure signup failed (portal sign-in error AADSTS50058, then "No subscriptions found"), so the user chose edge-tts instead.
- Implemented with the npm package `msedge-tts` (MIT): no account, same Bulgarian neural voices (`bg-BG-KalinaNeural`, `bg-BG-BorislavNeural`). Python `edge-tts` was not usable here (no `python3-venv`/pip).
- Risk: unofficial client of the Edge read-aloud service. Generated clips are committed, so the app is unaffected if the service changes; only regeneration would need another source.
- Overrides support alternative text and a speaking `rate`; custom SSML is not available through this service.

## Voice — pending

Samples of both voices at normal and slow rate are in `spike/voices.html`; the user picks one. `tools/audio-config.ts` holds the voice (currently `bg-BG-KalinaNeural` as a placeholder).
