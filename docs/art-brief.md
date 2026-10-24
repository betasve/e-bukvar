# Art brief — journey map illustrations

Prompt for an image-generation agent. Paste everything inside the block below.

```
You are creating illustrations for "Чета" ("I read"), a gentle web app that teaches a
6-year-old Bulgarian girl to read. She already knows most letters; the app helps her
blend letters into syllables (М + А → МА) and then read short words (МАМА, ЛУНА, ЛИМОН).
It runs on tablets and phones, in portrait orientation.

HOW THE GAME WORKS
The child travels along a journey map. The map is divided into six regions, stacked
vertically and scrolled top to bottom. Each region holds 4–9 "stops" (round buttons the
app draws itself, ~90 px across), placed in a zig-zag: alternating left (≈28% of the
width) and right (≈72%), one every ~120 px down the page, joined by a dotted trail the
app also draws. Tapping a stop opens a 5–7 minute lesson. She earns stickers and
collects them in an album with one themed page per region.

WHAT I NEED: ONE BACKGROUND ILLUSTRATION PER REGION
1. Поляна (Meadow) — the start. Sunny open meadow, wildflowers (daisies, sunflowers,
   tulips), butterflies, ladybugs, bees, a snail. Palette around fresh green #7CC576,
   warm yellow, soft sky blue.
2. Гора (Forest) — friendly, light-filled woodland, never dark or scary. Fox, bear cub,
   hedgehog, deer, owl, squirrel, rabbit, mushrooms. Palette around deep green #3F9B6B
   with warm sunlight.
3. Река (River) — a gentle river with stepping stones, reeds, a small wooden bridge,
   fish, frog, duck. Palette: teal and blue water, green banks.
4. Планина (Mountain) — rounded friendly mountains in the style of the Bulgarian
   Rila/Pirin ranges, meadows with sheep, a mountain hut, goats, an eagle in the sky.
   Palette: soft blue-grey peaks, green slopes, white snow caps.
5. Село (Village) — a traditional Bulgarian village: white houses with red-tile roofs
   and wooden balconies, a well, a cherry tree, chickens, a cat on a fence, a garden
   with vegetables. Palette: warm whites, terracotta red, leafy green.
6. Море (Sea) — the Black Sea coast: sandy beach, gentle waves, seashells, a small
   lighthouse, sailboat, seagulls, crab, dolphins in the distance. Palette: turquoise,
   sand beige, sunny yellow. This is the final destination and should feel celebratory.

COMPOSITION RULES (important — the app places interactive elements on top)
- Portrait, 1080 × 1620 px (2:3). Keep the full width usable; it will be scaled to
  phone (360 px) and tablet (768–900 px) widths.
- Keep a calm, low-detail vertical band in the middle 60% of the width, top to bottom,
  where the stops and trail sit. Put the rich details (animals, trees, houses) along the
  left and right edges and in the corners.
- No path or trail in the image (the app draws its own), or at most a very faint,
  wide, soft ground strip that winds gently down the centre.
- Top and bottom 120 px should blend softly into the next region (soft fade or
  matching horizon), so regions stack seamlessly.
- Low contrast in the centre band so dark letters (#2B2A33) on white/yellow circles
  stay easy to read.

STYLE
- Flat, friendly vector illustration for young children: rounded shapes, soft
  gradients at most, thick soft outlines, cheerful but not neon. It should sit
  comfortably next to OpenMoji-style icons (simple, outlined, flat colour).
- Warm, safe, calm: no scary creatures, no weapons, no darkness, no clutter.
- Consistent style, lighting and outline weight across all six regions, as if made by
  one illustrator for one book.
- Base page colour of the app is a warm cream #FFF8EC; illustrations should harmonise
  with it.

ABSOLUTELY NO TEXT
- No letters, words, numbers, signs, labels, logos or watermarks anywhere. The app
  overlays all Bulgarian text itself; stray letters would confuse a child learning to
  read.

OPTIONAL EXTRAS (same style, same rules)
- Start screen hero, 1080 × 1080: a child-friendly open book with a trail leading out
  of it into a meadow, forest and distant sea.
- Lesson background per region, 1080 × 1920: a very soft, mostly empty version of the
  region (blurred or pale edges only), because large letters and answer cards cover the
  centre.
- Sticker album page per region, 1080 × 1350: a light paper texture with a small
  themed border (flowers, leaves, waves…); the centre must stay plain for a grid of
  sticker slots.

DELIVERABLES
For each image: PNG (or SVG if possible), the exact size above, filename like
region-1-polyana.png, region-2-gora.png, region-3-reka.png, region-4-planina.png,
region-5-selo.png, region-6-more.png.
```

## Notes for wiring the images in

- Regions 1–2 already use green `--r1` `#7CC576` and `--r2` `#3F9B6B` in `ui/theme.css`; regions 3–6 get their colours from the returned images.
- The app keeps drawing its own stops and trail on top of each region background (`ui/screens/Journey.svelte`), so a drawn path in an image is decoration only.
- Images go under `public/` and are precached by the service worker, so they work offline.
