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
    exercise: Extract<Exercise, { kind: 'hear-letter' }>
    solved: boolean
    reveal: boolean
    onanswer: (choice: string) => Promise<AnswerResult>
  } = $props()
</script>

<OptionGrid options={exercise.options} correct={exercise.letter} look="print" {solved} {reveal} {onanswer} />
