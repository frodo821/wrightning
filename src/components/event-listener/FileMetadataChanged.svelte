<script lang="ts">
  import message from '../../events/message';
  import fs from '../../infrastructure/fs';
  import type { File, Workspace } from '../../types/files';

  export let workspace: Workspace;
  export let files: File[];
</script>

<svelte:window
  on:file-metadata-changed={async ({ detail: { id } }) => {
    if (!fs.ready) {
      return;
    }

    const target = files.find((it) => it.id === id);

    if (typeof target === 'undefined') {
      const file = await fs.getFile(workspace.id, id);

      if (typeof file === 'undefined') {
        message.error('Internal error detected. Please try again later.');
      } else {
        files = [...files, file];
      }
      return;
    }

    fs.saveFile(target);
    files = files;
  }}
/>
