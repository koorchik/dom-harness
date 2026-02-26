<script setup lang="ts">
import { ref } from 'vue';
import { TextInput } from '../text-input';
import { Button } from '../button';

const username = ref('');
const password = ref('');
const submitted = ref(false);

function handleSubmit() {
  submitted.value = true;
}
</script>

<template>
  <form data-testid="login-form" @submit.prevent="handleSubmit">
    <TextInput name="username" type="text" v-model="username" />
    <TextInput name="password" type="password" v-model="password" />
    <Button type="submit">Login</Button>
    <p v-if="submitted" data-testid="welcome">Welcome, {{ username }}!</p>
  </form>
</template>
