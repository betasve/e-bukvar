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
    exercise: Extract<Exercise, { kind: 'read-match' }>
    solved: boolean
    reveal: boolean
    onanswer: (choice: string) => Promise<AnswerResult>
  } = $props()
</script>

<div class="word print">{exercise.word}</div>
<OptionGrid options={exercise.options} correct={exercise.word} look="picture" {solved} {reveal} {onanswer} />

<style>
  .word {
    font-size: 64px;
    letter-spacing: 4px;
    min-height: 90px;
  }
</style>
