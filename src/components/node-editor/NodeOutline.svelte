<script lang="ts">
  import type * as nodes from '../../data/structure';

  export let node: nodes.DataNode;
  export let depth: number = 0;
</script>

{#if depth === 0}
  <ul class="root-container">
    <li class="container">
      <div class="self-link">
        <a href={`#${node.id}`}>{node.title || 'unnamed'}</a>
      </div>
      {#if node.type === 'paragraph'}
        <ul class="children">
          {#each node.children as child}
            <li class="child-item">
              <svelte:self node={child} depth={depth + 1} />
            </li>
          {/each}
        </ul>
      {/if}
    </li>
  </ul>
{:else}
  <li class="container">
    <div class="self-link">
      <a href={`#${node.id}`}>{node.title || 'unnamed'}</a>
    </div>
    {#if node.type === 'paragraph'}
      <ul class="children">
        {#each node.children as child}
          <li class="child-item">
            <svelte:self node={child} depth={depth + 1} />
          </li>
        {/each}
      </ul>
    {/if}
  </li>
{/if}

<style lang="scss">
  ul {
    &.children {
      padding-inline-start: 1.5rem;
    }
  }

  a {
    user-select: none;
  }
</style>
