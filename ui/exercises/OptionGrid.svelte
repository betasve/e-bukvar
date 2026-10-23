<script lang="ts">
  import { content } from '../../content'
  import Picture from '../components/Picture.svelte'
  import type { AnswerResult } from '../lesson/session'

  let {
    options,
    correct,
    look,
    solved,
    reveal,
    onanswer,
  }: {
    options: string[]
    correct: string
    look: 'print' | 'hand' | 'picture'
    solved: boolean
    reveal: boolean
    onanswer: (choice: string) => Promise<AnswerResult>
  } = $props()

  let shaking = $state<string | null>(null)

  const pictureOf = (word: string) => content.words.find((w) => w.text === word)?.picture ?? ''

  async function pick(option: string) {
    const result = await onanswer(option)
    if (result === 'wrong' || result === 'reveal') {
      shaking = option
      setTimeout(() => (shaking = null), 500)
    }
  }
</script>

<div class="grid" class:three={options.length === 3}>
  {#each options as option (option)}
    <button
      class="option {look}"
      class:shake={shaking === option}
      class:right={solved && option === correct}
      class:reveal={reveal && !solved && option === correct}
      data-option={option}
      onclick={() => pick(option)}
    >
      {#if look === 'picture'}
        <Picture hex={pictureOf(option)} size={88} />
      {:else}
        {option}
      {/if}
    </button>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    width: min(100%, 460px);
  }
  .grid.three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .option {
    min-height: 104px;
    border-radius: var(--radius);
    background: var(--card);
    box-shadow: 0 5px 0 var(--line);
    display: grid;
    place-items: center;
    font-size: 54px;
    line-height: 1;
    transition: background 0.2s, transform 0.08s;
  }
  .option:active {
    transform: translateY(3px);
  }
  .print {
    font-family: var(--font-print);
    font-weight: 800;
  }
  .hand {
    font-family: var(--font-hand);
    font-weight: 400;
    font-size: 60px;
  }
  .right {
    background: var(--ok);
    color: white;
  }
  .reveal {
    background: var(--glow);
    animation: glow 1s ease-in-out infinite;
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
  @keyframes glow {
    50% {
      box-shadow: 0 0 0 8px color-mix(in srgb, var(--glow) 50%, transparent);
    }
  }
</style>
