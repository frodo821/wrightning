<script lang="ts">
  import type * as nodes from '../data/structure';

  export let node: nodes.DataNode;
  export let depth: number = 0;
  export let nth: number = 0;
</script>


{#if depth === 0}
  <ul class="root-container">
    <li class="container">
      <div class="self-link">
        <a href={`#${depth}.${nth}.${node.title ?? 'unnamed'}`}>{node.title ?? 'unnamed'}</a>
      </div>
      {#if node.type === 'paragraph'}
        <ul class="children">
          {#each node.children as child, i}
            <li class="child-item">
              <svelte:self node={child} depth={depth + 1} nth={i} />
            </li>
          {/each}
        </ul>
      {/if}
    </li>
  </ul>
{:else}
  <li class="container">
    <div class="self-link">
      <a href={`#${depth}.${nth}.${node.title ?? 'unnamed'}`}>{node.title ?? 'unnamed'}</a>
    </div>
    {#if node.type === 'paragraph'}
      <ul class="children">
        {#each node.children as child, i}
          <li class="child-item">
            <svelte:self node={child} depth={depth + 1} nth={i} />
          </li>
        {/each}
      </ul>
    {/if}
  </li>
{/if}

