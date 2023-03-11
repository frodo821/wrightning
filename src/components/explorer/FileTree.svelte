<script lang="ts">
  import { onMount } from 'svelte';
  import { collator } from '../../data/sorting';
  import FileEntry from './FileEntry.svelte';
  import { type DirTree, dirTreeMarker } from './type';

  export let tree: DirTree;
  export let parentKey: string = '';

  let self: HTMLDetailsElement | null;

  let createNewFile = false;

  onMount(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    window.addEventListener(
      'request-for-file-creation',
      ({ detail: { key } }) => {
        if (key === parentKey) {
          createNewFile = true;
        }
      },
      { signal }
    );

    window.addEventListener('create-file', () => {
      createNewFile = false;
    }, { signal });

    return () => {
      controller.abort();
    };
  });
</script>

<details
  class="container"
  class:root={parentKey === ''}
  open={parentKey === ''}
  bind:this={self}
>
  <summary>{parentKey}</summary>
  <ul tabindex="-1" on:focus={() => self?.dispatchEvent(new CustomEvent(
    'select-entry-changed',
    { detail: { key: parentKey }, bubbles: true }
  ))}>
    {#if createNewFile}
      <FileEntry {parentKey} oncancellation={() => createNewFile = false} />
    {/if}
    {#each Object.entries(tree).sort(([a], [b]) => collator.compare(a, b)) as [key, entry]}
      {#key key}
        {#if dirTreeMarker in entry}
          <li>
            <svelte:self tree={entry} parentKey={`${parentKey}/${key}`} />
          </li>
        {:else}
          <FileEntry {entry} name={key} {parentKey} />
        {/if}
      {/key}
    {/each}
  </ul>
</details>

<style lang="scss">
  details.root {
    > summary::marker {
      content: none;
    }
  }

  details:not(.root) {
    padding-left: 1rem;
    border-left: dotted 1px gray;
  }

  ul {
    margin: 0;
    padding-left: 0;
  }
</style>
