<script lang="ts">
  import { onMount } from 'svelte'
  import type { AudioPlayer } from '../../audio/player'
  import type { Exercise } from '../../engine/exercises'
  import Picture from '../components/Picture.svelte'
  import { ICONS } from '../icons'
  import { promptSteps } from '../prompts'

  let {
    exercise,
    player,
    ondone,
  }: {
    exercise: Extract<Exercise, { kind: 'watch-blend' }>
    player: AudioPlayer
    ondone: () => void
  } = $props()

  const letters = $derived([...exercise.syllable])
  let together = $state(false)
  let finished = $state(false)

  // The prompt ends with the syllable clip; slide the letters together just before it.
  async function run() {
    together = false
    finished = false
    const steps = promptSteps(exercise)
    await player.playSequence(steps.slice(0, -1))
    together = true
    await player.playSequence(steps.slice(-1))
    finished = true
  }

  onMount(() => {
    run()
  })
</script>

<div class="pair" class:together>
  <span class="letter print">{letters[0]}</span>
  <span class="letter print">{letters[1]}</span>
</div>
{#if finished}
  <div class="actions">
    <button class="icon-button" aria-label="Пак" onclick={run}><Picture hex={ICONS.speaker} size={44} /></button>
    <button class="big-button" data-testid="next" aria-label="Напред" onclick={ondone}>
      <Picture hex={ICONS.next} size={44} />
    </button>
  </div>
{/if}

<style>
  .pair {
    display: flex;
    justify-content: center;
    gap: 120px;
    transition: gap 0.6s ease-in-out;
  }
  .pair.together {
    gap: 0;
  }
  .letter {
    font-size: 110px;
    line-height: 1;
  }
  .together .letter {
    color: var(--accent);
  }
  .actions {
    display: flex;
    gap: 20px;
    align-items: center;
  }
</style>
