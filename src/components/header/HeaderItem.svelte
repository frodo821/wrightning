<script lang="ts">
  import { Item, Text } from '@smui/list';

  type EventArgsFactory<T extends Event> = T extends CustomEvent<infer U> ? () => U : never;

  type T = $$Generic<keyof WindowEventMap>;

  export let eventName: T;
  export let eventArgsFactory: EventArgsFactory<WindowEventMap[T]> | undefined = undefined;
</script>

<Item
  on:click={() => {
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventArgsFactory?.() }));
  }}
>
  <Text><slot /></Text>
</Item>
