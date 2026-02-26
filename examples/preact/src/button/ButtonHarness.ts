import { DomHarness } from 'dom-harness';

export class ButtonHarness extends DomHarness {
  static testid = 'button';
  get button() { return this.root as HTMLButtonElement; }
  async click() { await this.user.click(this.button); }
  text() { return this.button.textContent ?? ''; }
}
