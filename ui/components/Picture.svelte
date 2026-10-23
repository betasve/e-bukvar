<script lang="ts">
  let { hex, size = 64, alt = '' }: { hex: string; size?: number; alt?: string } = $props()
</script>

<img src={`${import.meta.env.BASE_URL}pictures/${hex}.svg`} {alt} width={size} height={size} draggable="false" />

<style>
  img {
    display: block;
    pointer-events: none;
  }
</style>
