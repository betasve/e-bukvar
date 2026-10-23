<script lang="ts">
  import { content } from '../../content'
  import type { Progress } from '../../engine/progress'
  import Picture from '../components/Picture.svelte'
  import { ICONS } from '../icons'

  let { progress, onback }: { progress: Progress; onback: () => void } = $props()

  const have = $derived(new Set(progress.stickers.map((s) => s.id)))
</script>

<main class="screen" data-testid="album">
  <div class="topbar">
    <button class="icon-button" aria-label="Назад" onclick={onback}>
      <Picture hex={ICONS.back} size={44} />
    </button>
  </div>
  {#each content.regions as region (region.id)}
    <section class="page" style="--region: var(--{region.id})">
      <h2>{region.name}</h2>
      <div class="grid">
        {#each content.stickers.filter((s) => s.regionId === region.id) as s (s.id)}
          <div class="slot" class:large={s.large} data-sticker={s.id} data-collected={have.has(s.id)}>
            {#if have.has(s.id)}
              <Picture hex={s.picture} size={s.large ? 120 : 64} />
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/each}
</main>

<style>
  .page {
    margin-bottom: 20px;
    padding: 12px;
    border-radius: var(--radius);
    background: var(--card);
    box-shadow: 0 4px 0 var(--line);
  }
  h2 {
    margin: 0 0 12px;
    text-align: center;
    font-size: 24px;
    color: color-mix(in srgb, var(--region) 70%, var(--ink));
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
    gap: 10px;
  }
  .slot {
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    border-radius: 16px;
    border: 3px dashed color-mix(in srgb, var(--region) 40%, white);
  }
  .slot[data-collected='true'] {
    border-style: solid;
    border-color: transparent;
    background: color-mix(in srgb, var(--region) 15%, white);
  }
  .slot.large {
    grid-column: span 2;
    grid-row: span 2;
  }
</style>
