import { render } from '@testing-library/angular';
import { TextInputComponent } from './text-input.component';
import { TextInputHarness } from './TextInputHarness';

describe('TextInput', () => {
  it('should accept typed input', async () => {
    await render(TextInputComponent, { componentInputs: { name: 'email', type: 'text', value: '' } });
    const input = TextInputHarness.first();

    await input.type('hello');

    expect(input.value()).toBe('hello');
    expect(input.name()).toBe('email');
  });
});
