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

  import ContentChanged from '../components/event-listener/ContentChanged.svelte';
  import WorkspaceDetailEdited from '../components/event-listener/WorkspaceDetailEdited.svelte';
  import CreateFile from '../components/event-listener/CreateFile.svelte';
  import FileMetadataChanged from '../components/event-listener/FileMetadataChanged.svelte';
  import OpenFile from '../components/event-listener/OpenFile.svelte';
  import ExportFileRequest from '../components/event-listener/ExportFileRequest.svelte';

  let workspaces: Workspace[] = [];
  let currentWorkspaceIndex: number = 0;
  let files: File[] = [];
  let currentFileIndex: number = 0;

  let node: nodes.DataNode = nodes.createParagraphNode([nodes.createTextNode('')]);

  $: {
    if (files[currentFileIndex] !== undefined) {
      node = JSON.parse(files[currentFileIndex].content);
    }
  }

  onMount(async () => {
    try {
      eventManager.initialize();
      fs.initialize();

      await fs.waitForReady;
      workspaces = await fs.getWorkspaces();

      if (workspaces.length === 0) {
        const workspace = await fs.createWorkspace('<default-workspace>');
        workspaces = [workspace];
      }

      files = await fs.getFiles(workspaces[currentWorkspaceIndex].id);
    } catch (err: any) {
      message.fatal(`${err}`);
      console.error(err);
    }
  });
</script>

{#if workspaces.length > currentWorkspaceIndex}
  <ContentChanged file={files[currentFileIndex]} {node} />
  <WorkspaceDetailEdited workspace={workspaces[currentWorkspaceIndex]} />
  <CreateFile workspace={workspaces[currentWorkspaceIndex]} bind:files bind:currentFileIndex />
  <FileMetadataChanged workspace={workspaces[currentWorkspaceIndex]} bind:files />
  <OpenFile {files} bind:currentFileIndex />
  <ExportFileRequest file={files[currentFileIndex]} />
{/if}

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
    {#if files.length > currentFileIndex}
      <TextEditor {node} />
    {:else}
      <div class="empty">
        <h1>No files to open</h1>
        <p>
          There are no files to open. You can
          <a href="/" on:click={(ev) => ev.preventDefault()}>
            create a new file
          </a>
          to open.
        </p>
      </div>
    {/if}
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
