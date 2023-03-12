<script lang="ts">
  import message from '../../events/message';
  import fs from '../../infrastructure/fs';
  import type { File } from '../../types/files';

  export let files: File[];
  export let currentFileIndex: number;
</script>

<svelte:window
  on:open-file={({ detail: { file } }) => {
    if (!fs.ready) {
      return;
    }
    const fi = files.findIndex((it) => it.path === file.path);

    if (fi === -1) {
      message.error(`File ${file.path} not found.`);
    } else {
      currentFileIndex = fi;
    }
  }}
/>
