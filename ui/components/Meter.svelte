<script lang="ts">
  import { METER_SIZE } from '../../engine/progress'
  import { ICONS } from '../icons'
  import Picture from './Picture.svelte'

  let { value }: { value: number } = $props()
</script>

<div class="meter" data-testid="meter" data-value={value} aria-label="{value} / {METER_SIZE}">
  {#each Array(METER_SIZE) as _, i (i)}
    <span class="slot" class:full={i < value}>
      {#if i < value}<Picture hex={ICONS.star} size={26} />{/if}
    </span>
  {/each}
</div>

<style>
  .meter {
    display: flex;
    gap: 4px;
  }
  .slot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 3px dashed var(--line);
    display: grid;
    place-items: center;
  }
  .slot.full {
    border: none;
    animation: pop 0.3s;
  }
  @keyframes pop {
    50% {
      transform: scale(1.4);
    }
  }
</style>
