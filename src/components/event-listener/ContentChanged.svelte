<script lang="ts">
  import type { DataNode } from "../../data/structure";
  import fs from "../../infrastructure/fs";
  import type { File } from "../../types/files";

  export let file: File | undefined;
  export let node: DataNode;
</script>

<svelte:window 
  on:content-changed={() => {
    if (!fs.ready || typeof file === 'undefined') {
      return;
    }

    file.content = JSON.stringify(node);
    fs.saveFile(file);
  }}
/>
