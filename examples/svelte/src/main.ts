import { mount } from 'svelte';
import { LoginForm } from './login-form';

const app = mount(LoginForm, { target: document.getElementById('app')! });

export default app;
