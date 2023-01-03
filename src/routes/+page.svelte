<script lang="ts">
  import * as nodes from '../data/structure';
  import TextEditor from '../components/TextEditor.svelte';

  let node: nodes.DataNode = nodes.createParagraphNode([
    nodes.createTextNode('Hello, world!'),
  ]);

  if ('window' in globalThis) {
    (window as any).text = node;
  }

  if ('localStorage' in globalThis) {
    const saved = localStorage.getItem('content');
    if (saved) {
      node = JSON.parse(saved);
    }
  }
</script>


<div class="editor-layout">
  <div class="header"></div>
  <div class="sidebar-left"></div>
  <div class="main">
    <TextEditor {node} />
  </div>
  <div class="sidebar-right"></div>
  <div class="footer"></div>
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
      "header header header"
      "sidebar-left main sidebar-right"
      "footer footer footer";
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
    }
    > .footer {
      grid-area: footer;
    }
  }
</style>
