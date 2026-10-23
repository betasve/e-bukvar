<script lang="ts">
  import { onMount } from 'svelte'
  import type { Profile, ProgressStore } from '../../storage/store'
  import { AVATARS } from '../avatars'
  import Picture from '../components/Picture.svelte'

  let { store, onchoose }: { store: ProgressStore; onchoose: (p: Profile) => void } = $props()

  let profiles = $state<Profile[]>([])
  let creating = $state(false)
  let name = $state('')
  let avatar = $state(AVATARS[0])
  const valid = $derived(name.trim().length >= 1 && name.trim().length <= 20)

  onMount(async () => {
    profiles = await store.listProfiles()
  })

  // crypto.randomUUID needs a secure context; plain http on a home network isn't one.
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

  async function save() {
    if (!valid) return
    const p: Profile = { id: newId(), name: name.trim(), avatar }
    await store.saveProfile(p)
    onchoose(p)
  }
</script>

<main class="screen">
  {#if creating}
    <form
      class="create"
      onsubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <input data-testid="profile-name" bind:value={name} maxlength="20" placeholder="Име" autocomplete="off" />
      <div class="avatars">
        {#each AVATARS as hex (hex)}
          <button
            type="button"
            class="avatar"
            class:chosen={avatar === hex}
            data-testid="avatar-{hex}"
            aria-pressed={avatar === hex}
            onclick={() => (avatar = hex)}
          >
            <Picture {hex} size={64} />
          </button>
        {/each}
      </div>
      <div class="actions">
        <button type="button" class="icon-button" aria-label="Назад" onclick={() => (creating = false)}>✕</button>
        <button type="submit" class="big-button" data-testid="profile-save" disabled={!valid}>Готово</button>
      </div>
    </form>
  {:else}
    <div class="grid">
      {#each profiles as p (p.id)}
        <button class="card" onclick={() => onchoose(p)}>
          <Picture hex={p.avatar} size={96} />
          <span>{p.name}</span>
        </button>
      {/each}
      <button class="card add" data-testid="profile-new" aria-label="Нов профил" onclick={() => (creating = true)}>
        <span class="plus">+</span>
      </button>
    </div>
  {/if}
</main>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
    padding-top: 24px;
  }
  .card {
    display: grid;
    justify-items: center;
    gap: 8px;
    padding: 20px 8px;
    border-radius: var(--radius);
    background: var(--card);
    box-shadow: 0 4px 0 var(--line);
    font-size: 22px;
  }
  .add {
    border: 3px dashed var(--line);
    box-shadow: none;
    background: transparent;
    place-content: center;
  }
  .plus {
    font-size: 64px;
    line-height: 1;
    color: var(--muted);
  }
  .create {
    display: grid;
    gap: 20px;
    padding-top: 24px;
  }
  input {
    font: inherit;
    font-size: 28px;
    padding: 14px 18px;
    border-radius: var(--radius);
    border: 3px solid var(--line);
    background: var(--card);
    color: var(--ink);
    width: 100%;
  }
  .avatars {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .avatar {
    display: grid;
    place-items: center;
    padding: 8px;
    border-radius: var(--radius);
    background: var(--card);
    border: 4px solid transparent;
  }
  .avatar.chosen {
    border-color: var(--accent);
  }
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
