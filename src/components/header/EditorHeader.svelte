<script lang="ts">
  import type * as Nodes from '../../data/structure';
  import { Item, Separator, Text } from '@smui/list';
  import HeaderMenu from './HeaderMenu.svelte';
  import HeaderItem from './HeaderItem.svelte';
  import { currentSelectionKey } from '../explorer/store';
</script>

<div class="header-container">
  <HeaderMenu shortcut="Alt+F" menuLabel="File">
    <HeaderItem
      eventName="request-for-file-creation"
      eventArgsFactory={() => ({ key: $currentSelectionKey ?? '' })}
    >
      New File
    </HeaderItem>
    <Item>
      <Text>Open File</Text>
    </Item>
    <Item>
      <Text>New Workspace</Text>
    </Item>
    <Item>
      <Text>Open Workspace</Text>
    </Item>
    <Separator />
    <Item>
      <Text>Save</Text>
    </Item>
    <Item>
      <Text>Save As</Text>
    </Item>
    <Item>
      <Text>Download File</Text>
    </Item>
    <Item>
      <Text>Download Workspace</Text>
    </Item>
    <HeaderItem eventName="export-file-request">Export File As...</HeaderItem>
    <Separator />
    <Item>
      <Text>Close</Text>
    </Item>
    <Item>
      <Text>Close All</Text>
    </Item>
    <Item>
      <Text>Discard Unsaved File Changes</Text>
    </Item>
    <Item>
      <Text>Discard Unsaved Workspace Changes</Text>
    </Item>
    <Separator />
    <Item>
      <Text>Delete File</Text>
    </Item>
    <Item>
      <Text>Delete Workspace</Text>
    </Item>
  </HeaderMenu>
  <HeaderMenu shortcut="Alt+E" menuLabel="Edit">
    <Item>
      <Text>Undo</Text>
    </Item>
    <Item>
      <Text>Redo</Text>
    </Item>
    <Separator />
    <Item>
      <Text>Cut</Text>
    </Item>
    <Item>
      <Text>Copy</Text>
    </Item>
    <Item>
      <Text>Paste</Text>
    </Item>
    <Separator />
    <Item>
      <Text>Find</Text>
    </Item>
    <Item>
      <Text>Replace</Text>
    </Item>
    <Separator />
    <Item>
      <Text>Find in Files</Text>
    </Item>
    <Item>
      <Text>Replace in Files</Text>
    </Item>
    <Separator />
    <Item>
      <Text>Insert Previous Sibling Section</Text>
    </Item>
    <Item>
      <Text>Insert Next Sibling Section</Text>
    </Item>
    <Item>
      <Text>Insert Child Section</Text>
    </Item>
    <Item>
      <Text>Delete Section</Text>
    </Item>
  </HeaderMenu>
</div>
