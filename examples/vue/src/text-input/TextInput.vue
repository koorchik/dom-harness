<script setup lang="ts">
defineProps<{
  name?: string;
  type?: string;
  modelValue?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <input
    data-testid="text-input"
    :name="name"
    :type="type"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
