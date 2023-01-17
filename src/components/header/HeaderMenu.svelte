<script lang="ts">
  import Button from '@smui/button';
  import List from '@smui/list';
  import MenuSurface, { Corner } from '@smui/menu-surface';

  export let shortcut: string | undefined;
  export let menuLabel: string;
  export let anchorCorner: keyof typeof Corner = "BOTTOM_LEFT";

  let surf: MenuSurface | undefined;
</script>


<div class="menu-item-wrapper" style:float="left">
  <Button style="max-height: 2rem" aria-keyshortcuts={shortcut} on:click={() => surf?.setOpen(true)}>{menuLabel}</Button>
  <MenuSurface anchorCorner={anchorCorner} bind:this={surf} on:click={() => surf?.setOpen(false)}>
    <List>
      <slot />
    </List>
  </MenuSurface>
</div>

<style lang="scss">
  .menu-item-wrapper :global(.mdc-deprecated-list-item) {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;
    padding: 0;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 5px;
    padding-bottom: 5px;
    font-size: 0.8rem;
    height: min-content;
  }
</style>
