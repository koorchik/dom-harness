import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ButtonTest from './ButtonTest.svelte';
import { ButtonHarness } from './ButtonHarness';

describe('Button', () => {
  it('should render text', async () => {
    render(ButtonTest);
    const button = ButtonHarness.first();

    expect(button.text()).toBe('Click me');
  });
});
