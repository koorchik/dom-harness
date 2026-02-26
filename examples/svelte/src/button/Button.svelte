<script lang="ts">
  import type { Snippet } from 'svelte';

  let { type = 'button', children }: { type?: HTMLButtonElement['type']; children?: Snippet } = $props();
</script>

<button data-testid="button" {type}>
  {#if children}
    {@render children()}
  {/if}
</button>
