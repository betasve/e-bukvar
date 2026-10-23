<script lang="ts">
  import type { Exercise } from '../../engine/exercises'
  import type { AnswerResult } from '../lesson/session'
  import OptionGrid from './OptionGrid.svelte'

  let {
    exercise,
    solved,
    reveal,
    onanswer,
  }: {
    exercise: Extract<Exercise, { kind: 'print-hand' }>
    solved: boolean
    reveal: boolean
    onanswer: (choice: string) => Promise<AnswerResult>
  } = $props()

  const toHand = $derived(exercise.direction === 'print-to-hand')
</script>

<div class="target" class:print={toHand} class:hand={!toHand}>{exercise.letter}</div>
<OptionGrid
  options={exercise.options}
  correct={exercise.letter}
  look={toHand ? 'hand' : 'print'}
  {solved}
  {reveal}
  {onanswer}
/>

<style>
  .target {
    font-size: 96px;
    line-height: 1.1;
    min-height: 110px;
  }
</style>
