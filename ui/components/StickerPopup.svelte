<script lang="ts">
  import { content } from '../../content'
  import Picture from './Picture.svelte'

  let { id }: { id: string } = $props()

  const sticker = $derived(content.stickers.find((s) => s.id === id))
</script>

{#if sticker}
  <div class="overlay" data-testid="sticker-popup">
    <div class="card">
      <Picture hex={sticker.picture} size={sticker.large ? 200 : 150} />
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--ink) 35%, transparent);
    z-index: 10;
  }
  .card {
    padding: 28px;
    border-radius: 32px;
    background: var(--card);
    animation: arrive 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
  }
  @keyframes arrive {
    from {
      transform: scale(0.2) rotate(-20deg);
    }
  }
</style>
