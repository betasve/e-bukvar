<script lang="ts">
  import { handFileName } from '../hand'

  // Every letter image shares one frame and baseline, so `height` sets the same scale for all of them.
  // A wide capital (М, Ж) shrinks to fit a narrow button instead of overflowing it.
  let { letter, height }: { letter: string; height: number } = $props()
</script>

<img class="hand" src={`${import.meta.env.BASE_URL}hand/${handFileName(letter)}`} alt={letter} style:height={`${height}px`} draggable="false" />

<style>
  img {
    display: block;
    width: auto;
    max-width: 100%;
    object-fit: contain;
    pointer-events: none;
  }
</style>
