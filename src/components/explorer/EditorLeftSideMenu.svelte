<script lang="ts">
  import type { Workspace, File } from '../../types/files';
  import FileTree from './FileTree.svelte';
  import { dirTreeMarker, type DirTree } from './type';

  export let workspace: Workspace;
  export let files: File[];
  let tree: DirTree;

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
</script>

<div class="container">
  <div class="controls">
    <details open>
      <summary>{workspace.name}</summary>
      <FileTree {tree} />
    </details>
  </div>
</div>
