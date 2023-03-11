<script lang="ts">
  import * as nodes from '../data/structure';
  import TextEditor from '../components/TextEditor.svelte';
  import EditorLeftSideMenu from '../components/explorer/EditorLeftSideMenu.svelte';
  import EditorHeader from '../components/header/EditorHeader.svelte';
  import eventManager from '../events/eventManager';
  import { onMount } from 'svelte';
  import fs from '../infrastructure/fs';
  import message from '../events/message';
  import type { File, Workspace } from '../types/files';

  let workspaces: Workspace[] = [];
  let currentWorkspaceIndex: number = 0;
  let files: File[] = [];
  let currentFileIndex: number = 0;

  export const prerender = true;

  let node: nodes.DataNode = nodes.createParagraphNode([nodes.createTextNode('Hello, world!')]);

  $: {
    if (files[currentFileIndex] !== undefined) {
      node = JSON.parse(files[currentFileIndex].content);
    }
  }

  function collidesName(path: string, existing: string): boolean {
    if (existing.match(new RegExp(`^${path}(?:/|$)`))) {
      return true;
    }

    if (path.match(`^${existing}(?:/|$)`)) {
      return true;
    }

    return false;
  }

  onMount(() => {
    const abortController = new AbortController();

    window.addEventListener('content-changed', () => {
      if (!fs.ready) { return; }
      files[currentFileIndex].content = JSON.stringify(node);
      fs.saveFile(files[currentFileIndex]);
    }, { signal: abortController.signal });

    window.addEventListener('workspace-detail-edited', () => {
      if (!fs.ready) { return; }
      fs.saveWorkspace(workspaces[currentWorkspaceIndex]);
    }, { signal: abortController.signal });

    window.addEventListener('create-file', async ({ detail: { path } }) => {
      if (!fs.ready) { return; }
      if (files.find(it => collidesName(path, it.path)) !== undefined) {
        message.error(`File name ${path} conflicts existing file.`);
        return;
      }

      const file = await fs.createFile(
        workspaces[currentWorkspaceIndex].id,
        path,
        JSON.stringify(nodes.createTextNode(''))
      );

      currentFileIndex = files.length;
      files = [...files, file];
    }, { signal: abortController.signal });

    window.addEventListener('file-metadata-changed', async ({ detail: { id } }) => {
      if (!fs.ready) { return; }
      const target = files.find((it) => it.id === id);

      if (typeof target === 'undefined') {
        const file = await fs.getFile(workspaces[currentWorkspaceIndex].id, id);

        if (typeof file === 'undefined') {
          message.error('Internal error detected. Please try again later.');
        } else {
          files = [...files, file];
        }
        return;
      }

      fs.saveFile(target);
      files = files;
    }, { signal: abortController.signal });

    window.addEventListener('open-file', ({ detail: { file } }) => {
      if (!fs.ready) { return; }
      const fi = files.findIndex((it) => it.path === file.path);

      if (fi === -1) {
        message.error(`File ${file.path} not found.`);
      } else {
        currentFileIndex = fi;
      }
    }, { signal: abortController.signal });

    return () => {
      abortController.abort();
    }
  });

  onMount(async () => {
    try {
      eventManager.initialize();
      fs.initialize();

      await fs.waitForReady;
      workspaces = await fs.getWorkspaces();
      files = await fs.getFiles(workspaces[currentWorkspaceIndex].id);
    } catch (err: any) {
      message.fatal(`${err}`);
    }
  });
</script>

<div class="editor-layout">
  <div class="header">
    <EditorHeader />
  </div>
  <div class="sidebar-left">
    {#if workspaces.length > currentWorkspaceIndex}
      <EditorLeftSideMenu workspace={workspaces[currentWorkspaceIndex]} {files} />
    {/if}
  </div>
  <div class="main">
    <TextEditor {node} />
  </div>
  <div class="sidebar-right" />
  <div class="footer" />
</div>

<style lang="scss">
  :global(body) {
    margin: 0;
    padding: 0;
  }

  .editor-layout {
    display: grid;
    grid-auto-rows: 1fr;
    grid-template-columns: 1.5fr 7fr /*1.5fr*/;
    grid-template-rows: 2rem 1fr 2rem;
    gap: 0px 0px;
    grid-template-areas:
      'header header header'
      'sidebar-left main sidebar-right'
      'footer footer footer';
    width: 100vw;
    height: 100vh;

    > .main {
      grid-area: main;
      overflow: hidden;
    }
    > .sidebar-right {
      grid-area: sidebar-right;
    }
    > .sidebar-left {
      grid-area: sidebar-left;
    }
    > .header {
      grid-area: header;
      background-color: #f0f0f0;
    }
    > .footer {
      grid-area: footer;
    }
  }
</style>
