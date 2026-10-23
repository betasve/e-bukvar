# Decisions

## Handwriting font — Lobster (2026-10-23)

- **Font:** Lobster by Pablo Impallari, SIL Open Font License 1.1. Bundled offline via `@fontsource/lobster`; used as `--font-hand` in `ui/theme.css`.
- **Why:** the user found it on nachalen-uchitel.blogspot.com and preferred it over Bad Script, Marck Script, Caveat, Comforter and Great Vibes. It is bold and easy to read at large sizes.
- **Bulgarian forms:** the font has a Bulgarian `locl` feature (Ф, ж, к, ю), applied automatically because the page is `lang="bg"`. Other letters use the default Cyrillic shapes.
- **Caveat:** a display script, heavier and more slanted than first-grade ръкописни letters. Revisit (or draw SVG letters) if her school's shapes differ too much once lowercase arrives in Plan 2.

## Voice — pending

Waiting for the Azure Speech key; samples will be compared before choosing. `tools/audio-config.ts` holds the voice (currently `bg-BG-KalinaNeural` as a placeholder).
