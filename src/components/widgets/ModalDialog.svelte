<script lang="ts">
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import { onMount } from 'svelte';
  import type { DialogOpenDetail } from '../../types/eventArgs';
  import { generateId } from '../../data/id';
  import Textfield from '@smui/textfield';

  let dialogDetails: DialogOpenDetail;
  let opened: boolean = false;
  let titleId = generateId();
  let contentId = generateId();
  let onCloseHandler: (() => void) | undefined;
  let value: string;

  onMount(() => {
    const handler = (ev: CustomEvent<DialogOpenDetail>) => {
      dialogDetails = ev.detail;

      switch (dialogDetails.type) {
        case 'notice':
        case 'alert':
          onCloseHandler = dialogDetails.onOk;
          break;
        case 'confirm':
        case 'prompt':
          onCloseHandler = dialogDetails.onCancel;
          break;
      }

      opened = true;
    };
    window.addEventListener('dialog-open', handler);

    return () => {
      window.removeEventListener('dialog-open', handler);
    };
  });

  const keyHandler = (ev: any) => {
    if (dialogDetails?.type !== 'prompt') {
      return;
    }
    if (ev.code === 'Escape') {
      ev.stopPropagation();
      dialogDetails.onCancel?.();
      return;
    }
    if (ev.code === 'Enter') {
      ev.stopPropagation();
      dialogDetails.onEnter?.(value || '');
      return;
    }
  };
</script>

<Dialog
  bind:open={opened}
  aria-labelledby={titleId}
  aria-describedby={contentId}
  on:SMUIDialog:closed={onCloseHandler}
>
  <Title id={titleId}>
    {#if dialogDetails?.type === 'notice'}
      <i class="material-icons">notifications</i>
    {:else if dialogDetails?.type === 'alert'}
      <i class="material-icons">warning</i>
    {/if}
    {dialogDetails?.title}
  </Title>
  <Content id={contentId}>
    {#if dialogDetails?.type === 'notice' || dialogDetails?.type === 'alert' || dialogDetails?.type === 'confirm'}
      {dialogDetails?.message}
    {:else if dialogDetails?.type === 'prompt'}
      <Textfield on:keydown={keyHandler} bind:value />
    {/if}
  </Content>
  <Actions>
    {#if dialogDetails?.type === 'notice'}
      <Button on:click={dialogDetails.onOk}>
        <Label>{dialogDetails.ok ?? 'OK'}</Label>
      </Button>
    {:else if dialogDetails?.type === 'alert'}
      <Button on:click={dialogDetails.onOk}>
        <Label>{dialogDetails.ok ?? 'OK'}</Label>
      </Button>
    {:else if dialogDetails?.type === 'confirm'}
      <Button on:click={dialogDetails.onCancel}>
        <Label>{dialogDetails.cancel ?? 'Cancel'}</Label>
      </Button>
      <Button on:click={dialogDetails.onOk}>
        <Label>{dialogDetails.ok ?? 'OK'}</Label>
      </Button>
    {/if}
  </Actions>
</Dialog>
