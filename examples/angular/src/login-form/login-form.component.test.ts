import { render, waitFor } from '@testing-library/angular';
import { LoginFormComponent } from './login-form.component';
import { LoginFormHarness } from './LoginFormHarness';

describe('LoginForm', () => {
  it('should show welcome message after login', async () => {
    const { fixture } = await render(LoginFormComponent);
    const form = LoginFormHarness.first();

    expect(form.welcomeText()).toBeNull();

    await form.usernameInput.type('testuser');
    await form.passwordInput.type('password123');
    await form.submitButton.click();
    fixture.detectChanges();

    await waitFor(() => {
      expect(form.welcomeText()).toBe('Welcome, testuser!');
    });
  });
});
