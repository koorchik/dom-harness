import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import { TextInput } from './';
import { TextInputHarness } from './TextInputHarness';

describe('TextInput', () => {
  it('should accept typed input', async () => {
    render(TextInput, { props: { name: 'email', type: 'text', modelValue: '' } });
    const input = TextInputHarness.first();

    await input.type('hello');

    expect(input.value()).toBe('hello');
    expect(input.name()).toBe('email');
  });
});
