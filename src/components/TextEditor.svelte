<script lang="ts">
  import type * as nodes from '../data/structure';
  import NodeTextEditor from './node-editor/NodeTextEditor.svelte';
  import NodeOutline from './node-editor/NodeOutline.svelte';

  export let node: nodes.DataNode;
</script>

<div class="editor-container">
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

<style lang="scss">
  .editor-container {
    display: grid;
    grid-template-columns: 5fr 1fr;
    height: 100%;

    > .editor {
      height: 100%;
      overflow: auto;
    }

    > .outline {
      height: 100%;
      overflow: auto;
    }
  }
</style>
