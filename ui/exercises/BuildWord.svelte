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
  let placed = $state<number[]>([]) // tile indexes in the order she tapped them
  let shaking = $state(false)

  async function tap(i: number) {
    if (solved || placed.includes(i)) return
    placed = [...placed, i]
    if (placed.length < exercise.tiles.length) return
    const result = await onanswer(placed.map((j) => exercise.tiles[j]).join('-'))
    if (result === 'wrong' || result === 'reveal') {
      shaking = true
      setTimeout(() => {
        shaking = false
        placed = []
      }, 500)
    }
  }
</script>

<Picture hex={picture} size={110} />
<div class="slots" class:shake={shaking} class:solved>
  {#each exercise.tiles as _, slot (slot)}
    <div class="slot print">{placed[slot] !== undefined ? exercise.tiles[placed[slot]] : ''}</div>
  {/each}
</div>
<div class="tiles">
  {#each exercise.tiles as tile, i (i)}
    <button class="tile print" data-tile={tile} disabled={placed.includes(i)} onclick={() => tap(i)}>{tile}</button>
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
