<script lang="ts">
  import Picture from '../components/Picture.svelte'
  import { ICONS } from '../icons'

  let { ready, onstart }: { ready: boolean; onstart: () => void } = $props()
</script>

<main class="start">
  <Picture hex={ICONS.book} size={140} />
  <h1>Чета</h1>
  <button class="big-button" data-testid="start" disabled={!ready} onclick={onstart}>Започни</button>
  <p class="credit">Emoji graphics: OpenMoji – CC BY-SA 4.0</p>
</main>

<style>
  .start {
    min-height: 100dvh;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 20px;
    padding: 16px;
  }
  h1 {
    margin: 0;
    font-size: 64px;
    font-weight: 800;
    color: var(--accent);
  }
  .credit {
    margin-top: 32px;
    font-size: 12px;
    font-weight: 400;
    color: var(--muted);
  }
</style>
