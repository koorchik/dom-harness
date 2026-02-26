import { DomHarness } from 'dom-harness';

export class TextInputHarness extends DomHarness {
  static testid = 'text-input';
  get input() { return this.root as HTMLInputElement; }
  static byName(name: string, container?: Element) { return this.find(h => h.name() === name, container); }
  async type(value: string) { await this.user.type(this.input, value); }
  value() { return this.input.value; }
  name() { return this.input.name; }
}
