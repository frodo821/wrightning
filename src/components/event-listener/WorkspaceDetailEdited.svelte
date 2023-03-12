<script lang="ts">
  import fs from "../../infrastructure/fs";
  import type { Workspace } from "../../types/files";

  export let workspace: Workspace;
</script>

<svelte:window
  on:workspace-detail-edited={() => {
    if (!fs.ready) {
      return;
    }

    fs.saveWorkspace(workspace);
  }}
/>