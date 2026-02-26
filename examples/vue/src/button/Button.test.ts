import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/vue';
import { Button } from './';
import { ButtonHarness } from './ButtonHarness';

describe('Button', () => {
  it('should render text and handle click', async () => {
    const onClick = vi.fn();
    render(Button, { props: { type: 'button' }, attrs: { onClick }, slots: { default: 'Click me' } });
    const button = ButtonHarness.first();

    expect(button.text()).toBe('Click me');

    await button.click();

    expect(onClick).toHaveBeenCalledOnce();
  });
});
