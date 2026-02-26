<script lang="ts">
  let { value = $bindable(''), name, type = 'text' }: { value?: string; name?: string; type?: string } = $props();
</script>

<input data-testid="text-input" {name} {type} bind:value />
