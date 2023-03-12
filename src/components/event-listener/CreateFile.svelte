<script lang="ts">
  import * as nodes from '../../data/structure';
  import message from '../../events/message';
  import fs from '../../infrastructure/fs';
  import type { File, Workspace } from '../../types/files';

  export let files: File[];
  export let workspace: Workspace;
  export let currentFileIndex: number;

  function collidesName(path: string, existing: string): boolean {
    if (existing.match(new RegExp(`^${path}(?:/|$)`))) {
      return true;
    }

    if (path.match(`^${existing}(?:/|$)`)) {
      return true;
    }

    return false;
  }
</script>

<svelte:window
  on:create-file={async ({ detail: { path } }) => {
    if (!fs.ready) {
      return;
    }

    if (files.find((it) => collidesName(path, it.path)) !== undefined) {
      message.error(`File name ${path} conflicts existing file.`);
      return;
    }

    const file = await fs.createFile(workspace.id, path, JSON.stringify(nodes.createTextNode('')));

    currentFileIndex = files.length;
    files = [...files, file];
  }}
/>
