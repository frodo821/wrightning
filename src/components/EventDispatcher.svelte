<script lang="ts">
  import EventManager from '../events/eventManager';
  import type { SaveAsEventDetail } from '../types/eventArgs';
  import { onMount } from 'svelte';
  import fs from '../infrastructure/fs';
  import type { Workspace, File } from '../types/files';

  let workspaces: Workspace[];
  let files: Record<string, File> = {};

  onMount(() => {
    fs.waitForReady.then(() => {
      fs.getWorkspaces().then((ws) => {
        workspaces = ws;
      });
    });

    function handleSaveAs(event: CustomEvent<SaveAsEventDetail>) {
      fs.waitForReady.then(async () => {
        const { file, node, forceOverwrite } = event.detail;

        if (file.path in files) {
          if (!forceOverwrite) {
            return;
          }
          const _file = files[file.path];
          Object.assign(_file, file);
          _file.content = node;
          _file.lastModified = new Date().valueOf();

          return fs.saveFile(_file);
        }

        files[file.path] = await fs.createFile(file.workspace, file.path, node);
      });
    }

    window.addEventListener('save-as', handleSaveAs);

    return () => {
      window.removeEventListener('save-as', handleSaveAs);
    };
  });
</script>

<svelte:window on:keyup={EventManager.handleKeyUp} />
