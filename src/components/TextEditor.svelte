<script lang="ts">
  import type * as nodes from '../data/structure';
  import NodeTextEditor from './node-editor/NodeTextEditor.svelte';
  import NodeOutline from './node-editor/NodeOutline.svelte';
  import EventDispatcher from './EventDispatcher.svelte';
  import NotificationMessage from './widgets/NotificationMessage.svelte';
  import ModalDialog from './widgets/ModalDialog.svelte';

  export let node: nodes.DataNode;
</script>

<NotificationMessage />
<ModalDialog />
<EventDispatcher />

<div class="editor-container">
  <div class="editor">
    <NodeTextEditor
      {node}
      notifyChangesToParent={() => {
        window.dispatchEvent(new CustomEvent('content-changed'));
        node = node;
      }}
    />
  </div>
  <div class="outline">
    <div class="outline-wrapper">
      <NodeOutline {node} />
    </div>
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

      > .outline-wrapper {
        padding: 0.2rem 0.5rem;
      }
    }
  }
</style>
