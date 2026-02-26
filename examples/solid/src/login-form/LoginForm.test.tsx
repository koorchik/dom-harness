import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { LoginForm } from './LoginForm';
import { LoginFormHarness } from './LoginFormHarness';

describe('LoginForm', () => {
  it('should show welcome message after login', async () => {
    render(() => <LoginForm />);
    const form = LoginFormHarness.first();

    expect(form.welcomeText()).toBeNull();

    await form.usernameInput.type('testuser');
    await form.passwordInput.type('password123');
    await form.submitButton.click();

    expect(form.welcomeText()).toBe('Welcome, testuser!');
  });
});
