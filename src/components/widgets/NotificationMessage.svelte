<script lang="ts">
  import Snackbar, { Label, Actions } from '@smui/snackbar';
  import LinearProgress from '@smui/linear-progress';
  import IconButton from '@smui/icon-button';
  import type { OpenMessageBarDetail } from '../../types/eventArgs';
  import { onMount } from 'svelte';

  const defaultMessageTimeout = 10000;

  let snackbar: Snackbar;
  let snackbarDetails: OpenMessageBarDetail & { timeout: number } = {
    message: '',
    severity: 'notice',
    timeout: defaultMessageTimeout,
  };

  onMount(() => {
    const handler = (ev: CustomEvent<OpenMessageBarDetail>) => {
      snackbarDetails = {...ev.detail, timeout: defaultMessageTimeout};
      (snackbar as any).open();

      let previousTimestamp = 0;

      requestAnimationFrame(function handleTick(timestamp) {
        if (previousTimestamp === 0) {
          previousTimestamp = timestamp;
        }
        snackbarDetails.timeout -= timestamp - previousTimestamp;
        previousTimestamp = timestamp;
        if (snackbarDetails.timeout <= 0) {
          snackbarDetails.timeout = 0;
          return;
        }
        requestAnimationFrame(handleTick);
      });
    };

    window.addEventListener('snackbar-open', handler);

    return () => {
      window.removeEventListener('snackbar-open', handler);
    };
  });
</script>

<Snackbar
  class={`message-${snackbarDetails.severity} message-bar`}
  bind:this={snackbar}
  labelText={snackbarDetails.message}
  timeoutMs={defaultMessageTimeout}
  leading
>
  <Label />
  <Actions>
    <IconButton class="material-icons" title="Dismiss">close</IconButton>
  </Actions>
  <LinearProgress class="remaining-time-indicator" progress={snackbarDetails.timeout/defaultMessageTimeout}/>
</Snackbar>

<style lang="scss">
  :global(.message-bar) {
    :global(.remaining-time-indicator) {
      position: absolute;
      bottom: 0;
    }
  }
</style>
