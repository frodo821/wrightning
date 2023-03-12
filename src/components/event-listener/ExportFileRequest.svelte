<script lang="ts">
  import message from "../../events/message";
  import type { File } from "../../types/files";
  import * as nodes from '../../data/structure';

  export let file: File | undefined;
</script>

<svelte:window
  on:export-file-request={() => {
    if (typeof file === 'undefined') {
      message.error('No file to export.');
      return;
    }

    const a = document.createElement('a');
    a.style.position = 'absolute';
    a.style.opacity = '0';

    const markdown = nodes.toMarkdown(JSON.parse(file.content));

    const blob = new Blob([markdown], {
      type: 'text/plain',
    });

    a.href = URL.createObjectURL(blob);
    a.download = `${file.path.split('/').reverse()[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    message.success(`File ${file.path} exported.`);
  }}
/>