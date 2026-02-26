import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import { TextInput } from './TextInput';
import { TextInputHarness } from './TextInputHarness';

describe('TextInput', () => {
  it('should accept typed input', async () => {
    render(<TextInput name="email" type="text" />);
    const input = TextInputHarness.first();

    await input.type('hello');

    expect(input.value()).toBe('hello');
    expect(input.name()).toBe('email');
  });
});
