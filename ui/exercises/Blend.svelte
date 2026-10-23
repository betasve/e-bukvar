<script lang="ts">
  import type { AudioPlayer } from '../../audio/player'
  import { clipKey } from '../../content/clips'
  import type { Exercise } from '../../engine/exercises'

  let {
    exercise,
    player,
    ondone,
  }: {
    exercise: Extract<Exercise, { kind: 'blend' }>
    player: AudioPlayer
    ondone: () => void
  } = $props()

  const letters = $derived([...exercise.syllable])
  let selected = $state(false) // first letter tapped
  let joined = $state(false)
  let dragX = $state(0)
  let dragStart: number | null = null
  let gapPx = 0

  async function join() {
    if (joined) return
    joined = true
    dragX = 0
    await player.play(clipKey.syllable(exercise.syllable))
    setTimeout(ondone, 600)
  }

  // Tap the first letter then the second, or drag the first onto the second.
  function tapFirst() {
    if (!joined) selected = true
  }
  function tapSecond() {
    if (selected) join()
  }

  function down(e: PointerEvent) {
    const second = (e.currentTarget as HTMLElement).parentElement!.querySelector('[data-testid="blend-second"]')!
    gapPx = second.getBoundingClientRect().left - (e.currentTarget as HTMLElement).getBoundingClientRect().left
    dragStart = e.clientX
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  function move(e: PointerEvent) {
    if (dragStart !== null) dragX = Math.max(0, e.clientX - dragStart)
  }
  function up() {
    if (dragStart === null) return
    dragStart = null
    if (dragX > gapPx * 0.6) join()
    else dragX = 0
  }
</script>

<div class="pair" class:joined>
  <button
    class="tile print"
    class:selected
    data-testid="blend-first"
    style="transform: translateX({dragX}px)"
    onclick={tapFirst}
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
  >
    {letters[0]}
  </button>
  <button class="tile print" data-testid="blend-second" onclick={tapSecond}>{letters[1]}</button>
</div>

<style>
  .pair {
    display: flex;
    justify-content: center;
    gap: 80px;
    transition: gap 0.4s ease-in-out;
  }
  .pair.joined {
    gap: 0;
  }
  .tile {
    width: 112px;
    height: 128px;
    border-radius: var(--radius);
    background: var(--card);
    box-shadow: 0 5px 0 var(--line);
    font-size: 80px;
    line-height: 1;
    touch-action: none;
  }
  .tile.selected {
    background: var(--glow);
  }
  .joined .tile {
    background: var(--ok);
    color: white;
    border-radius: 0;
  }
  .joined .tile:first-child {
    border-radius: var(--radius) 0 0 var(--radius);
  }
  .joined .tile:last-child {
    border-radius: 0 var(--radius) var(--radius) 0;
  }
</style>
