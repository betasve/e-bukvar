<script lang="ts">
  import { content } from '../../content'
  import type { Exercise } from '../../engine/exercises'
  import Picture from '../components/Picture.svelte'
  import type { AnswerResult } from '../lesson/session'

  let {
    exercise,
    solved,
    onanswer,
  }: {
    exercise: Extract<Exercise, { kind: 'build-word' }>
    solved: boolean
    onanswer: (choice: string) => Promise<AnswerResult>
  } = $props()

  const picture = $derived(content.words.find((w) => w.text === exercise.word)?.picture ?? '')
  // svelte-ignore state_referenced_locally
  let slots = $state<(number | null)[]>(exercise.tiles.map(() => null)) // tile index in each slot
  let shaking = $state(false)
  let drag = $state<{ tile: number; dx: number; dy: number } | null>(null)
  let start = { x: 0, y: 0 }
  const TAP_SLOP = 8 // px a finger may wobble and still count as a tap

  const isPlaced = (i: number) => slots.includes(i)

  async function put(tile: number, slot: number) {
    if (solved) return
    slots = slots.map((t, j) => (j === slot ? tile : t === tile ? null : t))
    if (slots.some((t) => t === null)) return
    const result = await onanswer(slots.map((j) => exercise.tiles[j!]).join('-'))
    if (result === 'wrong' || result === 'reveal') {
      shaking = true
      setTimeout(() => {
        shaking = false
        slots = slots.map(() => null)
      }, 500)
    }
  }

  function tap(tile: number) {
    const free = slots.indexOf(null)
    if (free !== -1) void put(tile, free)
  }

  function takeBack(slot: number) {
    if (!solved && !shaking) slots = slots.map((t, j) => (j === slot ? null : t))
  }

  function down(e: PointerEvent, tile: number) {
    if (solved || isPlaced(tile)) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    start = { x: e.clientX, y: e.clientY }
    drag = { tile, dx: 0, dy: 0 }
  }

  function move(e: PointerEvent) {
    if (drag) drag = { ...drag, dx: e.clientX - start.x, dy: e.clientY - start.y }
  }

  function up(e: PointerEvent) {
    if (!drag) return
    const { tile, dx, dy } = drag
    drag = null
    if (Math.hypot(dx, dy) < TAP_SLOP) return tap(tile)
    // The dragged tile itself is on top, so look through it for a slot.
    const slot = document.elementsFromPoint(e.clientX, e.clientY).find((el) => el instanceof HTMLElement && el.dataset.slot)
    if (slot) void put(tile, Number((slot as HTMLElement).dataset.slot))
  }

  function key(e: MouseEvent, tile: number) {
    if (e.detail === 0) tap(tile) // Enter/Space; pointer taps are handled in up()
  }
</script>

{#if picture}<Picture hex={picture} size={110} />{/if}
<div class="slots" class:shake={shaking} class:solved>
  {#each slots as tile, slot (slot)}
    <button
      class="slot print"
      class:target={drag !== null && tile === null}
      data-slot={slot}
      aria-label={tile === null ? `Място ${slot + 1}` : exercise.tiles[tile]}
      onclick={() => takeBack(slot)}>{tile === null ? '' : exercise.tiles[tile]}</button
    >
  {/each}
</div>
<div class="tiles">
  {#each exercise.tiles as tile, i (i)}
    <button
      class="tile print"
      class:dragging={drag?.tile === i}
      style:transform={drag?.tile === i ? `translate(${drag.dx}px, ${drag.dy}px)` : undefined}
      data-tile={tile}
      disabled={isPlaced(i)}
      onpointerdown={(e) => down(e, i)}
      onpointermove={move}
      onpointerup={up}
      onpointercancel={() => (drag = null)}
      onclick={(e) => key(e, i)}>{tile}</button
    >
  {/each}
</div>

<style>
  .slots,
  .tiles {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
  .slot {
    min-width: 104px;
    height: 88px;
    border-radius: 18px;
    border: 4px dashed var(--line);
    display: grid;
    place-items: center;
    font-size: 48px;
  }
  .slot.target {
    border-color: var(--accent);
  }
  .solved .slot {
    border-style: solid;
    border-color: var(--ok);
    background: color-mix(in srgb, var(--ok) 20%, white);
  }
  .tile {
    min-width: 104px;
    height: 88px;
    border-radius: 18px;
    background: var(--card);
    box-shadow: 0 5px 0 var(--line);
    font-size: 48px;
    touch-action: none; /* the finger drags the tile instead of scrolling the page */
    user-select: none;
  }
  .tile.dragging {
    position: relative;
    z-index: 1;
    box-shadow: 0 10px 18px rgb(0 0 0 / 0.2);
  }
  .tile:disabled {
    visibility: hidden;
  }
  .shake {
    animation: shake 0.4s;
  }
  @keyframes shake {
    25% {
      transform: translateX(-8px);
    }
    75% {
      transform: translateX(8px);
    }
  }
</style>
