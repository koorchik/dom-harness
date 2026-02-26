import { DomHarness } from 'dom-harness';
import { TextInputHarness } from '../text-input/TextInputHarness';
import { ButtonHarness } from '../button/ButtonHarness';

export class LoginFormHarness extends DomHarness {
  static testid = 'login-form';

  get usernameInput() { return TextInputHarness.byName('username', this.root); }
  get passwordInput() { return TextInputHarness.byName('password', this.root); }
  get submitButton() { return ButtonHarness.first(this.root); }
  get welcomeMessage() { return this.queryElement('[data-testid="welcome"]', true); }

  welcomeText() { return this.welcomeMessage?.textContent ?? null; }
}
