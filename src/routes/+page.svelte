<script lang="ts">
  import * as nodes from '../data/structure';
  import NodeTextEditor from '../components/NodeTextEditor.svelte';
  import NodeOutline from '../components/NodeOutline.svelte';

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

<div class="container">
  <div class="editor">
    <NodeTextEditor
      {node}
      notifyChangesToParent={() => {
        localStorage.setItem('content', JSON.stringify(node));
        node = node;
      }}
    />
  </div>
  <div class="outline">
    <NodeOutline {node} />
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 5fr 1fr;
  }
</style>
