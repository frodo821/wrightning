<script lang="ts">
  import { Item, Text } from '@smui/list';

  export let eventName: keyof WindowEventMap;
  let currentSelectionKey: string;
</script>

{#if eventName === 'request-for-file-creation'}
  <Item
    on:click={() => {
      window.dispatchEvent(
        new CustomEvent('request-for-file-creation', {
          detail: { key: currentSelectionKey ?? '' },
        }),
      );
    }}
  >
    <Text><slot /></Text>
  </Item>
{:else}
  <Item
    on:click={() => {
      window.dispatchEvent(new CustomEvent(eventName));
    }}
  >
    <Text><slot /></Text>
  </Item>
{/if}
