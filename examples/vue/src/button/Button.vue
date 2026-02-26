<script setup lang="ts">
defineProps<{
  type?: HTMLButtonElement['type'];
}>();
</script>

<template>
  <button data-testid="button" :type="type">
    <slot />
  </button>
</template>
