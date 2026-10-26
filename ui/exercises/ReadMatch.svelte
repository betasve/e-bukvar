<script lang="ts">
  import { content } from '../../content'
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

  // Split into syllables (ЛИ-МОН) so she can read the word part by part.
  const syllables = $derived(content.words.find((w) => w.text === exercise.word)?.syllables ?? [exercise.word])
</script>

<div class="word print" data-testid="read-word">{syllables.join('-')}</div>
<OptionGrid options={exercise.options} correct={exercise.word} look="picture" {solved} {reveal} {onanswer} />

<style>
  .word {
    font-size: min(64px, 14vw);
    letter-spacing: 4px;
    min-height: 90px;
  }
</style>
