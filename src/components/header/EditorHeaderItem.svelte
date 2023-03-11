<script lang="ts">
  import { Item, Text } from "@smui/list";

  export let eventName: keyof WindowEventMap;
</script>

<Item action={() => {
  window.dispatchEvent(new CustomEvent(eventName));
}}>
  <Text><slot /></Text>
</Item>
