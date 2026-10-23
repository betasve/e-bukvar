<script lang="ts">
  import '@fontsource/nunito/700.css'
  import '@fontsource/nunito/800.css'
  import '@fontsource/bad-script/400.css'
  import './theme.css'
  import { onMount } from 'svelte'
  import { AudioPlayer } from '../audio/player'
  import type { Progress } from '../engine/progress'
  import { openStore, type Profile, type ProgressStore } from '../storage/store'
  import Album from './screens/Album.svelte'
  import Journey from './screens/Journey.svelte'
  import Lesson from './screens/Lesson.svelte'
  import Profiles from './screens/Profiles.svelte'
  import Start from './screens/Start.svelte'

  type Screen =
    | { name: 'start' }
    | { name: 'profiles' }
    | { name: 'journey' }
    | { name: 'album' }
    | { name: 'lesson'; stopId: string }

  let screen = $state<Screen>({ name: 'start' })
  let store = $state.raw<ProgressStore | null>(null)
  let player = $state.raw<AudioPlayer | null>(null)
  let profile = $state.raw<Profile | null>(null)
  let progress = $state.raw<Progress | null>(null)

  onMount(async () => {
    const [opened, loaded] = await Promise.all([openStore(), AudioPlayer.load(import.meta.env.BASE_URL)])
    store = opened.store
    player = loaded
  })

  async function start() {
    await player?.unlock()
    screen = { name: 'profiles' }
  }

  async function choose(p: Profile) {
    profile = p
    progress = await store!.loadProgress(p.id)
    screen = { name: 'journey' }
  }
</script>

{#if screen.name === 'start'}
  <Start ready={!!store && !!player} onstart={start} />
{:else if screen.name === 'profiles' && store}
  <Profiles {store} onchoose={choose} />
{:else if screen.name === 'journey' && progress && profile}
  <Journey
    {progress}
    {profile}
    onopen={(stopId) => (screen = { name: 'lesson', stopId })}
    onalbum={() => (screen = { name: 'album' })}
    onprofiles={() => (screen = { name: 'profiles' })}
  />
{:else if screen.name === 'lesson' && progress && store && player}
  <Lesson
    stopId={screen.stopId}
    {progress}
    {store}
    {player}
    onexit={(p) => {
      progress = p
      screen = { name: 'journey' }
    }}
  />
{:else if screen.name === 'album' && progress}
  <Album {progress} onback={() => (screen = { name: 'journey' })} />
{/if}
