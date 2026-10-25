<script lang="ts">
  import { handFileName } from '../hand'

  // Every letter image shares one frame and baseline, so `height` sets the same scale for all of them.
  let { letter, height }: { letter: string; height: number } = $props()
</script>

<img class="hand" src={`${import.meta.env.BASE_URL}hand/${handFileName(letter)}`} alt={letter} {height} draggable="false" />

<style>
  img {
    display: block;
    width: auto;
    pointer-events: none;
  }
</style>
