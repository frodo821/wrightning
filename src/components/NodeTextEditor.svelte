<script lang="ts">
  import * as nodes from '../data/structure'
  import type { EventArg } from '../types/eventArgs'

  export let node: nodes.DataNode
  export let parent: nodes.ParagraphNode | null = null
  export let notifyChangesToParent: () => void = () => {}
  export let requestFlatten: (nth: number) => void = () => {}
  export let depth: number = 0
  export let nth: number = 0

  let isExtended: boolean = true
  let editor: HTMLTextAreaElement

  function textAreaOnKeyDown(event: EventArg<KeyboardEvent, HTMLTextAreaElement>) {
    if (!event.ctrlKey) {
      return
    }

    const text = node as nodes.TextNode
    node = node
    notifyChangesToParent()

    if (event.key === 'Enter') {
      event.preventDefault()

      if (editor.selectionStart === 0) {
        nodes.insertNewNodeBeforeTextNode(text, nodes.createTextNode(''))
        requestFlatten(nth)
        return
      } else if (editor.selectionStart >= text.text.length) {
        nodes.insertNewNodeAfterTextNode(text, nodes.createTextNode(''))
        requestFlatten(nth)
        return
      }
      nodes.insertNewNodeToTextNode(text, nodes.createTextNode(''), editor.selectionStart)
      return
    }

    if (event.key === 'Backspace') {
      event.preventDefault()
      if (!parent) {
        return
      }

      if (!confirm('本当にセクションを削除しますか？')) {
        return
      }

      nodes.removeNodeFromParagraphNode(parent, text)
    }
  }

  function onFlattenRequested(nth: number) {
    if (node.type === 'text') {
      return
    }
    nodes.flattenParagraphNodeAt(node, nth)
    node = node
  }
</script>

<div class="nte-root" id={`${depth}.${nth}.${node.title ?? 'unnamed'}`}>
  <div class="nte-header" />
  <div class="nte-title">
    <input
      type="text"
      bind:value={node.title}
      placeholder="セクションのタイトル"
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
            editor.style.height = '0'
            editor.style.height = `${Math.max(editor.scrollHeight, 60)}px`
          }}
        />
      {:else}
        {#each node.children as child, idx}
          <svelte:self
            node={child}
            depth={depth + 1}
            nth={idx}
            parent={node}
            notifyChangesToParent={() => {
              notifyChangesToParent()
              nodes.canonicalizeNodes(node)
              node = node
            }}
            requestFlatten={onFlattenRequested}
          />
        {/each}
      {/if}
    {:else}
      <div class="retracted">{node.title}</div>
    {/if}
    <div class="nte-footer">
      <div class="nte-insert-child">
        <button
          on:click={() => {
            if (node.type === 'text') {
              nodes.insertNewNodeBeforeTextNode(node, nodes.createTextNode(''), true)
              requestFlatten(nth)
              notifyChangesToParent()
              return
            }
            node.children.unshift(nodes.createTextNode(''))
            requestFlatten(nth)
            notifyChangesToParent()
            return
          }}>直前に兄弟セクションを追加する</button
        >
      </div>
      <div class="nte-insert-child">
        <button
          on:click={() => {
            if (node.type === 'text') {
              nodes.insertNewNodeAfterTextNode(node, nodes.createTextNode(''))
              notifyChangesToParent()
              return
            }
            node.children.push(nodes.createTextNode(''))
            notifyChangesToParent()
            return
          }}>子セクションを追加する</button
        >
      </div>
      <div class="nte-insert-child">
        <button
          on:click={() => {
            if (node.type === 'text') {
              nodes.insertNewNodeAfterTextNode(node, nodes.createTextNode(''), true)
              requestFlatten(nth)
              notifyChangesToParent()
              return
            }
            node.children.push(nodes.createTextNode(''))
            requestFlatten(nth)
            notifyChangesToParent()
            return
          }}>直後に兄弟セクションを追加する</button
        >
      </div>
    </div>
  </div>
</div>

<style>
  .nte-root {
    display: flex;
    flex-direction: column;
    margin: 0.5em;
    padding: 0.5em;
    border-radius: 0.2rem;
    box-shadow: 1px 1px 3px 1px #1e1e2e5a;
  }

  .nte-root .nte-title input {
    height: 2rem;
    border: none;
    border-bottom: 2px solid;
    width: 100%;
    margin-right: 4rem;
    font-size: 1.8rem;
    font-weight: bold;
  }

  .nte-root .nte-title input:focus {
    outline: solid 2px skyblue;
  }

  .nte-root .nte-content textarea {
    overflow-y: hidden;
    min-height: 60px;
    resize: none;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo,
      sans-serif;
    font-size: 1.2rem;
    padding: 0.3rem;
    border-radius: 3px;
  }

  .nte-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .nte-title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .nte-content {
    display: flex;
    flex-direction: column;
    margin: 0.5em;
  }

  .nte-footer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .nte-insert-child {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .retracted {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
</style>
