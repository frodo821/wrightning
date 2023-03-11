<script lang="ts">
  import type { File } from '../../types/files';
  import { type DirTree, dirTreeMarker } from './type';

  export let tree: DirTree;
  export let parentKey: string = '';

  const anchorHandler = (target: File) => (ev: Event) => {
    ev.preventDefault();
    window.dispatchEvent(new CustomEvent('open-file', {
      detail: {
        file: target,
      },
    }));
  }

  const enterAsClick = (ev: KeyboardEvent) => {
    if (ev.code === 'Enter') {
      ev.preventDefault();
      (ev.currentTarget as any).click();
    }
  }
</script>

<ul>
  {#each Object.entries(tree) as [key, entry]}
    {#if dirTreeMarker in entry}
      <li>
        <svelte:self tree={entry} parentKey={`${parentKey}/${key}`} />
      </li>
    {:else}
      <li tabindex="-1" on:click={anchorHandler(entry)} on:keydown={enterAsClick}>
        <a tabindex="-1" href="/">{key}</a>
      </li>
    {/if}
  {/each}
</ul>

<style lang="scss">
  a {
    user-select: none;
  }

  li:focus, li:has(> a:focus) {
    background-color: lightgray;
  }
</style>
