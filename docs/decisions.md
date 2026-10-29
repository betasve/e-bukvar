# Decisions

## Handwritten letters — primer-traced SVGs (2026-10-25)

- **Source:** the user supplied all 30 capital and 30 lowercase ръкописни letters traced from a primer sheet (`~/bukvar-letters/letters2/`: `upper/`, `lower/`, `metrics.json`). They replace Lobster.
- **Import:** `npm run hand-letters -- <dir>` writes `public/hand/<codepoint>.svg` (committed). Every letter is re-framed to one common height and baseline using the sheet metrics, so а sits at x-height while б and д reach up and down, and one `height` gives every letter the same scale.
- **Same case as print (2026-10-25):** the handwritten letter now matches the printed one (print М ↔ handwritten М), at the user's request. This ends the Lobster-era "lowercase only" rule below and follows the spec's capitals-first order again. A capital too wide for a phone's answer button shrinks to fit.

## Handwriting font — Lobster (2026-10-23, replaced 2026-10-25)

- **Font:** Lobster by Pablo Impallari, SIL Open Font License 1.1. Bundled offline via `@fontsource/lobster`; used as `--font-hand` in `ui/theme.css`.
- **Why:** the user found it on nachalen-uchitel.blogspot.com and preferred it over Bad Script, Marck Script, Caveat, Comforter and Great Vibes. It is bold and easy to read at large sizes.
- **Bulgarian forms:** the font has a Bulgarian `locl` feature (Ф, ж, к, ю), applied automatically because the page is `lang="bg"`. Other letters use the default Cyrillic shapes.
- **Lowercase only (2026-10-24, ended 2026-10-25):** Lobster's capitals are too ornamental to model handwriting, so handwritten letters are always shown in lowercase (print М ↔ handwritten м), even while printed letters are capitals-only. This overrides the spec's "capitals only in regions 1–3" for the handwritten side.
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

## Й and Ь syllables (2026-10-29)

- Neither letter makes a consonant+vowel pair, so their stops had no syllables at all (an empty blending demo, no syllable practice).
- Й is taught after a vowel (АЙ, ОЙ, ЕЙ, ИЙ, УЙ); Ь as consonant+ЬО (ЛЬО, НЬО, …) after the consonants that take it (Б В Г Д З К Л М Н П Р С Т Ф).
- The Ь stop has no blending demo (it slides two letters together; ЛЬО is three). Syllable choices never offer what can't be written: Й or Ь first, Ь not before О, ЪЙ, or Ь after Ж Ч Ш Щ Ц.
