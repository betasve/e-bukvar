<script lang="ts">
  import { content } from '../../content'
  import { stopStatus } from '../../engine/journey'
  import type { Progress } from '../../engine/progress'
  import type { Profile } from '../../storage/store'
  import Picture from '../components/Picture.svelte'
  import { ICONS } from '../icons'

  let {
    progress,
    profile,
    onopen,
    onalbum,
    onprofiles,
  }: {
    progress: Progress
    profile: Profile
    onopen: (stopId: string) => void
    onalbum: () => void
    onprofiles: () => void
  } = $props()

  const ROW = 120 // px between stops
  const x = (i: number) => (i % 2 === 0 ? 28 : 72) // % across, zig-zag
  const y = (i: number) => i * ROW + ROW / 2
</script>

<main class="screen" data-testid="journey">
  <div class="topbar">
    <button class="icon-button" aria-label={profile.name} onclick={onprofiles}>
      <Picture hex={profile.avatar} size={48} />
    </button>
    <button class="icon-button" data-testid="open-album" aria-label="Стикери" onclick={onalbum}>
      <Picture hex={ICONS.album} size={44} />
      <span class="count">{progress.stickers.length}</span>
    </button>
  </div>

  {#each content.regions as region (region.id)}
    <section class="region" style="--region: var(--{region.id})">
      <h2>{region.name}</h2>
      <div class="path" style="height: {region.stops.length * ROW}px">
        <svg viewBox="0 0 100 {region.stops.length * ROW}" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            points={region.stops.map((_, i) => `${x(i)},${y(i)}`).join(' ')}
            vector-effect="non-scaling-stroke"
          />
        </svg>
        {#each region.stops as stop, i (stop.id)}
          {@const status = stopStatus(content, progress, stop.id)}
          <button
            class="stop {status}"
            data-testid="stop-{stop.id}"
            data-status={status}
            disabled={status === 'locked'}
            style="left: {x(i)}%; top: {y(i)}px"
            aria-label={stop.kind === 'letter' ? stop.newLetters.join(' ') : 'Приказка'}
            onclick={() => onopen(stop.id)}
          >
            {#if stop.kind === 'letter'}
              <span class="letters" style="--n: {stop.newLetters.length}">{stop.newLetters.join(' ')}</span>
            {:else}
              <Picture hex={ICONS.book} size={44} />
            {/if}
            {#if status === 'done'}<span class="badge">✓</span>{/if}
            {#if status === 'locked'}<span class="lock"><Picture hex={ICONS.lock} size={28} /></span>{/if}
          </button>
        {/each}
      </div>
    </section>
  {/each}
</main>

<style>
  .count {
    position: absolute;
    transform: translate(22px, 20px);
    min-width: 26px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--accent);
    color: var(--accent-ink);
    font-size: 15px;
  }
  .icon-button {
    position: relative;
  }
  .region {
    margin: 8px 0 24px;
    padding: 12px 0 4px;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--region) 18%, var(--bg));
  }
  h2 {
    margin: 0 0 4px;
    text-align: center;
    font-size: 26px;
    font-weight: 800;
    color: color-mix(in srgb, var(--region) 70%, var(--ink));
  }
  .path {
    position: relative;
  }
  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  polyline {
    fill: none;
    stroke: var(--region);
    stroke-width: 8;
    stroke-dasharray: 2 14;
    stroke-linecap: round;
  }
  .stop {
    position: absolute;
    width: 88px;
    height: 88px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--card);
    border: 5px solid var(--region);
    box-shadow: 0 5px 0 color-mix(in srgb, var(--region) 60%, black);
  }
  .letters {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: 2px;
    white-space: nowrap;
  }
  .letters {
    font-size: clamp(22px, calc(64px / var(--n, 1)), 32px);
  }
  .stop.open {
    background: var(--glow);
    animation: pulse 1.6s ease-in-out infinite;
  }
  .stop.locked {
    background: #eee;
    border-color: #ccc;
    box-shadow: 0 5px 0 #bbb;
    color: #aaa;
  }
  .lock {
    position: absolute;
    right: -6px;
    bottom: -6px;
  }
  .badge {
    position: absolute;
    right: -8px;
    top: -8px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--ok);
    color: white;
    display: grid;
    place-items: center;
    font-size: 20px;
  }
  /* Ring glow, not a scale: the button itself stays put so it is easy to tap. */
  @keyframes pulse {
    50% {
      box-shadow:
        0 5px 0 color-mix(in srgb, var(--region) 60%, black),
        0 0 0 12px color-mix(in srgb, var(--glow) 55%, transparent);
    }
  }
</style>
