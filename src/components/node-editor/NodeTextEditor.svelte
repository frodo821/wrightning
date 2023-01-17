<script lang="ts">
  import * as nodes from '../../data/structure';
  import type { EventArg } from '../../types/eventArgs';
  import IconButton from '@smui/icon-button';
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import Textfield from '@smui/textfield';

  export let node: nodes.DataNode;
  export let parent: nodes.ParagraphNode | null = null;
  export let notifyChangesToParent: () => void = () => {};
  export let requestFlatten: (nth: number) => void = () => {};
  export let depth: number = 0;
  export let nth: number = 0;

  let isExtended: boolean = true;
  let editor: HTMLTextAreaElement;

  function textAreaOnKeyDown(event: EventArg<KeyboardEvent, HTMLTextAreaElement>) {
    if (!event.ctrlKey) {
      return;
    }

    const text = node as nodes.TextNode;
    node = node;
    notifyChangesToParent();

    if (event.key === 'Enter') {
      event.preventDefault();

      if (editor.selectionStart === 0) {
        nodes.insertNewNodeBeforeTextNode(text, nodes.createTextNode(''));
        requestFlatten(nth);
        return;
      } else if (editor.selectionStart >= text.text.length) {
        nodes.insertNewNodeAfterTextNode(text, nodes.createTextNode(''));
        requestFlatten(nth);
        return;
      }
      nodes.insertNewNodeToTextNode(text, nodes.createTextNode(''), editor.selectionStart);
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      if (!parent) {
        return;
      }

      if (!confirm('本当にセクションを削除しますか？')) {
        return;
      }

      nodes.removeNodeFromParagraphNode(parent, text);
    }
  }

  function onFlattenRequested(nth: number) {
    if (node.type === 'text') {
      return;
    }
    nodes.flattenParagraphNodeAt(node, nth);
    node = node;
  }
</script>

<div class="nte-root" id={`${node.id}`}>
  <div class="nte-header" />
  <div class="nte-title">
    <button
      on:click={() => isExtended = !isExtended}
      class="nte-toggle-visible"
      class:extended={isExtended}
      class:retracted={!isExtended}
    >
      ▲
    </button>
    <Textfield
      class="nte-title-text"
      label="セクションのタイトル"
      bind:value={node.title}
      on:input={() => notifyChangesToParent()}
    />
  </div>
  <div class="nte-content">
    {#if isExtended}
      {#if node.type === 'text'}
        <textarea
          bind:value={node.text}
          bind:this={editor}
          on:keydown={textAreaOnKeyDown}
          on:input={() => {
            editor.style.height = '0';
            editor.style.height = `${Math.max(editor.scrollHeight, 80)}px`;
          }}
          placeholder="セクション本文を入力する"
        />
      {:else}
        {#each node.children as child, idx}
          <svelte:self
            node={child}
            depth={depth + 1}
            nth={idx}
            parent={node}
            notifyChangesToParent={() => {
              notifyChangesToParent();
              nodes.canonicalizeNodes(node);
              node = node;
            }}
            requestFlatten={onFlattenRequested}
          />
        {/each}
      {/if}
    {:else}
      <div class="nte-retracted-body" tabindex="-1" on:click={() => isExtended = true} on:keydown={(e) => {
        if (e.code === "Enter") {
          isExtended = true;
          e.preventDefault();
        }
      }}>...</div>
    {/if}
  </div>
  {#if isExtended}
    <div class="nte-footer">
      <Wrapper class="nte-insert-child">
        <IconButton
          class="material-icons"
          on:click={() => {
            if (node.type === 'text') {
              nodes.insertNewNodeBeforeTextNode(node, nodes.createTextNode(''), true);
              requestFlatten(nth);
              notifyChangesToParent();
              return;
            }
            node.children.unshift(nodes.createTextNode(''));
            requestFlatten(nth);
            notifyChangesToParent();
            return;
          }}>swipe_up_alt</IconButton
        >
        <Tooltip>1つ前のセクションを追加する</Tooltip>
      </Wrapper>
      <Wrapper class="nte-insert-child">
        <IconButton
          class="material-icons"
          on:click={() => {
            if (node.type === 'text') {
              nodes.insertNewNodeAfterTextNode(node, nodes.createTextNode(''));
              notifyChangesToParent();
              return;
            }
            node.children.push(nodes.createTextNode(''));
            notifyChangesToParent();
            return;
          }}>note_add</IconButton
        >
        <Tooltip>子セクションを追加する</Tooltip>
      </Wrapper>
      <Wrapper class="nte-insert-child">
        <IconButton
          class="material-icons"
          on:click={() => {
            const n = node;
            if (node.type === 'text') {
              nodes.insertNewNodeAfterTextNode(node, nodes.createTextNode(''), true);
              requestFlatten(nth);
              notifyChangesToParent();
              return;
            }
            if (node.type === 'paragraph') {
              node.children.push(nodes.createTextNode(''));
              requestFlatten(nth);
              notifyChangesToParent();
              return;
            }
            throw new Error(`unknown node type: '${n.type}'`);
          }}>swipe_down_alt</IconButton
        >
        <Tooltip>1つ後のセクションを追加する</Tooltip>
      </Wrapper>
      <Wrapper class="nte-insert-child nte-delete-this">
        <IconButton
          class="material-icons"
          disabled={parent === null}
          on:click={() => {
            if (!confirm('本当にセクションを削除しますか？')) {
              return;
            }
            if (parent) {
              nodes.removeNodeFromParagraphNode(parent, node);
            }
            notifyChangesToParent();
          }}>delete</IconButton
        >
        <Tooltip>このセクションを削除する</Tooltip>
      </Wrapper>
    </div>
  {/if}
</div>

<style lang="scss">
  .nte-root {
    display: flex;
    flex-direction: column;
    margin: 0.5rem 0 0.5rem 0.1rem;
    padding: 0.5rem 0 0.5rem 0.5rem;
    border-left: solid 4px var(--mdc-theme-secondary, #676778);
    position: relative;

    &:focus-within {
      border-left: solid 4px var(--mdc-theme-primary, #ff3e00);
    }

    .nte-title {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      :global(.nte-title-text) {
        border: none;
        width: 100%;
        margin-right: 4rem;
        font-size: 1.8rem;
        font-weight: bold;

        &:focus {
          border-bottom: solid 2px var(--mdc-theme-primary, #ff3e00);
          outline: none;
        }
      }
    }

    .nte-content {
      display: flex;
      flex-direction: column;
      margin: 0.5rem 0 0.5rem 0.5rem;

      textarea {
        overflow-y: hidden;
        min-height: 80px;
        resize: none;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo,
          sans-serif;
        font-size: 1.2rem;
        padding: 0.3rem;
        border: none;
        border-bottom: solid 1px gray;

        &:focus {
          outline: none;
          border-bottom: solid 2px var(--mdc-theme-primary, #ff3e00);
        }
      }
    }

    .nte-retracted-body {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      cursor: pointer;
    }

    .nte-toggle-visible {
      border: none;
      background: none;
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1.5rem;
      user-select: none;
      cursor: pointer;
      margin: auto 0;

      &.extended {
        transform: rotate(180deg);
      }

      &.retracted {
        transform: rotate(90deg);
      }
    }

    .nte-header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
  }

  .nte-footer {
    flex-direction: row;
    justify-content: space-between;
    display: flex;
    opacity: 0;
    position: absolute;
    right: 0;
    top: 2rem;
    background: white;
  }

  .nte-root .nte-content:focus-within+.nte-footer,
  .nte-root:hover > .nte-footer {
    opacity: 1;
  }
</style>
