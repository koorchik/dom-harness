import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from './Button';
import { ButtonHarness } from './ButtonHarness';

describe('Button', () => {
  it('should render text and handle click', async () => {
    const onClick = vi.fn();
    render(<Button type="button" onClick={onClick}>Click me</Button>);
    const button = ButtonHarness.first();

    expect(button.text()).toBe('Click me');

    await button.click();

    expect(onClick).toHaveBeenCalledOnce();
  });
});
