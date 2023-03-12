<script lang="ts">
  import message from '../../events/message';
  import type { File } from '../../types/files';

  export let entry: File | null = null;
  export let name: string = '';
  export let parentKey: string;

  export let oncancellation: () => void = () => {};

  let nameEditing = false;
  let intermediateName = name;

  let self: HTMLLIElement | null;

  const anchorHandler = (ev: Event) => {
    ev.preventDefault();
    window.dispatchEvent(
      new CustomEvent('open-file', {
        detail: {
          file: entry,
        },
      }),
    );
  };

  const fileKeyHandler = (ev: KeyboardEvent) => {
    if (ev.code === 'Enter') {
      ev.preventDefault();
      ev.stopPropagation();
      nameEditing = true;
    }
  };

  const blurHandler = (ev: Event) => {
    ev.preventDefault();
    ev.stopPropagation();
    oncancellation();
    nameEditing = false;
  };

  const nameEditHandler = async (ev: KeyboardEvent) => {
    if (ev.code === 'Enter') {
      if (intermediateName === '' || intermediateName.endsWith('/')) {
        message.error('file name cannot be empty.');
        return;
      }

      ev.preventDefault();
      ev.stopPropagation();

      if (entry === null) {
        window.dispatchEvent(
          new CustomEvent('create-file', { detail: { path: `${parentKey}/${intermediateName}` } }),
        );
      } else {
        entry.path = `${parentKey}/${intermediateName}`;
        window.dispatchEvent(
          new CustomEvent('file-metadata-changed', { detail: { id: entry.id } }),
        );
        nameEditing = false;
      }
    } else if (ev.code === 'Escape') {
      blurHandler(ev);
    }
  };
</script>

<li
  tabindex="-1"
  on:click={anchorHandler}
  on:keydown={fileKeyHandler}
  on:focus={() => {
    self?.dispatchEvent(
      new CustomEvent('select-entry-changed', { detail: { key: parentKey }, bubbles: true }),
    );
  }}
  bind:this={self}
>
  <a tabindex="-1" href="/">
    {#if nameEditing || entry === null}
      <input
        type="text"
        bind:value={intermediateName}
        on:keydown={nameEditHandler}
        on:blur={blurHandler}
        autofocus
      />
    {:else}
      {name}
    {/if}
  </a>
</li>

<style lang="scss">
  a {
    user-select: none;
  }

  li:focus,
  li:has(> a:focus) {
    background-color: lightgray;
  }

  li {
    padding-left: 1rem;
    border-left: dotted 1px gray;

    &::marker {
      content: none;
    }

    &:focus-visible {
      outline: none;
    }
  }
</style>
