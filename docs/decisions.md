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

## Voice — Kalina, normal speed (2026-10-23)

- `bg-BG-KalinaNeural` at the default rate, chosen by the user after listening to both voices at normal and slow speed.
- Letter sounds use the "consonant + ъ" spelling (`лъ`, `нъ`), which sounds right — except М: `мъ` is read as the letter name "ем", and every variant (`ммъ`, `мъ.`, `Мъ`, …) failed except a bare `м`. So `content/overrides.ts` maps `letter:М` to `м`.
- Other consonants (regions 3–6) may need their own overrides; check them on `/review.html` when they are added.
