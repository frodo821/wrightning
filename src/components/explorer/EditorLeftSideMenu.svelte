<script lang="ts">
  import IconButton from '@smui/icon-button';
  import type { Workspace, File } from '../../types/files';
  import FileTree from './FileTree.svelte';
  import { dirTreeMarker, type DirTree } from './type';

  export let workspace: Workspace;
  export let files: File[];

  let tree: DirTree;
  let currentSelectionKey: string;

  $: tree = createDirectoryTree(files);

  function createDirectoryTree(files: File[]) {
    const result: DirTree = {
      [dirTreeMarker]: true,
    };

    for(let file of files) {
      const [name, ...fragments] = file.path.split('/').reverse();

      let current: DirTree = result;

      for(let fragment of fragments.reverse()) {
        if (fragment === '') {
          continue;
        }

        if (current[fragment] === undefined) {
          current[fragment] = {
            [dirTreeMarker]: true,
          };
        }

        current = current[fragment] as DirTree;
      }

      current[name] = file;
    }

    return result;
  }

  const fileCreationHandler = () => {
    window.dispatchEvent(new CustomEvent('request-for-file-creation', { detail: { key: currentSelectionKey ?? '' } }));
  }
</script>

<div class="container">
  <div class="controls" on:select-entry-changed={({ detail: { key } }) => {
    currentSelectionKey = key;
  }}>
    <details open>
      <summary>
        {workspace.name}
        <div class="actions">
          <IconButton class="material-icons" on:click={fileCreationHandler}>note_add</IconButton>
          <!--IconButton class="material-icons">create_new_folder</IconButton-->
        </div>
      </summary>
      <FileTree {tree} />
    </details>
  </div>
</div>

<style lang="scss">
  .container {
    padding-left: 0.25rem;
    height: 100%;
  }
  details {
    ::marker {
      content: "expand_less";
      font-family: 'Material Icons';
    }
    &[open] ::marker {
      content: "expand_more";
    }
    summary {
      user-select: none;
      position: relative;
      padding-top: 2px;
      padding-bottom: 5px;

      > .actions {
        opacity: 0;
        transition: 200ms;
        position: absolute;
        right: 0;
        top: 0;

        :global(.material-icons) {
          padding: 0;
          width: 25px;
          height: 25px;
        }
      }
    }
  }

  .container:hover {
    details > summary > .actions {
      opacity: 1;
    }
  }
</style>
