<script lang="ts">
  import { onMount } from 'svelte'
  import type { AudioPlayer } from '../../audio/player'
  import { content } from '../../content'
  import { clipKey } from '../../content/clips'
  import { correctAnswer } from '../../engine/exercises'
  import { buildLesson } from '../../engine/lesson'
  import type { Progress } from '../../engine/progress'
  import type { ProgressStore } from '../../storage/store'
  import Meter from '../components/Meter.svelte'
  import Picture from '../components/Picture.svelte'
  import StickerPopup from '../components/StickerPopup.svelte'
  import BuildWord from '../exercises/BuildWord.svelte'
  import HearLetter from '../exercises/HearLetter.svelte'
  import HearSyllable from '../exercises/HearSyllable.svelte'
  import PrintHand from '../exercises/PrintHand.svelte'
  import ReadMatch from '../exercises/ReadMatch.svelte'
  import WatchBlend from '../exercises/WatchBlend.svelte'
  import { ICONS } from '../icons'
  import { LessonSession, type AnswerResult } from '../lesson/session'
  import { lessonClips, promptSteps } from '../prompts'

  let {
    stopId,
    progress,
    store,
    player,
    onexit,
  }: {
    stopId: string
    progress: Progress
    store: ProgressStore
    player: AudioPlayer
    onexit: (progress: Progress) => void
  } = $props()

  const e2e = import.meta.env.VITE_E2E === '1'
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  // The lesson is fixed for the life of this screen; `progress` is only the starting point.
  // svelte-ignore state_referenced_locally
  const exercises = buildLesson(content, stopId, progress, Math.random)
  let earned = $state<string[]>([])
  // svelte-ignore state_referenced_locally
  const session = new LessonSession(content, stopId, exercises, progress, {
    // A failed save must never interrupt her; progress stays in memory for this session.
    save: (p) => store.saveProgress(p).catch(() => undefined),
    now: () => Date.now(),
    onSticker: (id) => (earned = [...earned, id]),
  })

  let tick = $state(0) // bumped after every session change so derived values refresh
  let ready = $state(false)
  let solved = $state(false)
  let reveal = $state(false)
  let popup = $state<string | null>(null)
  let done = $state<string[] | null>(null)

  const current = $derived.by(() => {
    void tick
    return session.current
  })
  const index = $derived.by(() => {
    void tick
    return session.index
  })
  const meter = $derived.by(() => {
    void tick
    return session.meter
  })

  function prompt() {
    const ex = session.current
    // watch-blend runs its own sequence so the animation can follow the sound
    if (ex && ex.kind !== 'watch-blend') player.playSequence(promptSteps(ex))
  }

  onMount(() => {
    player.preload(lessonClips(exercises)).finally(() => {
      ready = true
      prompt()
    })
    return () => player.stop()
  })

  async function showStickers() {
    while (earned.length) {
      popup = earned[0]
      await player.play(clipKey.phrase('sticker'))
      await sleep(900)
      earned = earned.slice(1)
    }
    popup = null
  }

  async function advance() {
    await session.next()
    solved = false
    reveal = false
    tick++
    if (session.current) {
      prompt()
      return
    }
    const stickers = await session.finish()
    earned = []
    tick++
    done = stickers
  }

  async function react(result: AnswerResult) {
    if (result === 'correct') {
      solved = true
      await player.play(clipKey.phrase('bravo'))
      await showStickers()
      await advance()
    } else if (result === 'wrong' || result === 'reveal') {
      if (result === 'reveal') reveal = true
      await player.play(clipKey.phrase('try-again'))
      prompt()
    }
  }

  async function answer(choice: string): Promise<AnswerResult> {
    const result = await session.answer(choice)
    tick++
    void react(result)
    return result
  }

  function exit() {
    player.stop()
    onexit(session.progress)
  }
</script>

<main class="lesson" data-testid="lesson">
  <div class="topbar">
    <button class="icon-button" aria-label="Към пътечката" onclick={exit}>
      <Picture hex={ICONS.close} size={36} />
    </button>
    <div class="dots" aria-hidden="true">
      {#each exercises as _, i (i)}
        <span class="dot" class:past={i < index} class:now={i === index}></span>
      {/each}
    </div>
    <Meter value={meter} />
  </div>

  {#if done}
    <div class="stage" data-testid="lesson-done">
      <div class="earned">
        {#each done as id (id)}
          {@const s = content.stickers.find((x) => x.id === id)}
          {#if s}<span data-earned={id}><Picture hex={s.picture} size={s.large ? 160 : 110} /></span>{/if}
        {:else}
          <!-- Every sticker is already collected (a replay): still end on a reward. -->
          <span data-testid="done-trophy"><Picture hex={ICONS.trophy} size={140} /></span>
        {/each}
      </div>
      <button class="big-button" data-testid="done-back" aria-label="Към пътечката" onclick={exit}>
        <Picture hex={ICONS.next} size={44} />
      </button>
    </div>
  {:else if ready && current}
    {#key index}
      <div
        class="stage"
        data-testid="exercise"
        data-kind={current.kind}
        data-index={index}
        data-answer={e2e ? correctAnswer(current) : undefined}
      >
        {#if current.kind !== 'watch-blend'}
          <button class="icon-button speaker" aria-label="Чуй пак" onclick={prompt}>
            <Picture hex={ICONS.speaker} size={40} />
          </button>
        {/if}
        {#if current.kind === 'hear-letter'}
          <HearLetter exercise={current} {solved} {reveal} onanswer={answer} />
        {:else if current.kind === 'print-hand'}
          <PrintHand exercise={current} {solved} {reveal} onanswer={answer} />
        {:else if current.kind === 'watch-blend'}
          <WatchBlend exercise={current} {player} ondone={advance} />
        {:else if current.kind === 'hear-syllable'}
          <HearSyllable exercise={current} {solved} {reveal} onanswer={answer} />
        {:else if current.kind === 'build-word'}
          <BuildWord exercise={current} {solved} onanswer={answer} />
        {:else if current.kind === 'read-match'}
          <ReadMatch exercise={current} {solved} {reveal} onanswer={answer} />
        {/if}
      </div>
    {/key}
  {/if}

  {#if popup}<StickerPopup id={popup} />{/if}
</main>

<style>
  .lesson {
    height: 100dvh;
    display: grid;
    grid-template-rows: auto 1fr;
    max-width: 900px;
    margin: 0 auto;
    padding: 12px 16px 16px;
    overflow: hidden;
  }
  .topbar {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .dots {
    flex: 1;
    display: flex;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--line);
  }
  .dot.past {
    background: var(--ok);
  }
  .dot.now {
    background: var(--accent);
    transform: scale(1.4);
  }
  .stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 22px;
    min-height: 0;
  }
  .earned {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
  }
</style>
