import { render } from '@testing-library/angular';
import { ButtonComponent } from './button.component';
import { ButtonHarness } from './ButtonHarness';

describe('Button', () => {
  it('should render text', async () => {
    await render('<app-button type="button">Click me</app-button>', { imports: [ButtonComponent] });
    const button = ButtonHarness.first();

    expect(button.text()).toBe('Click me');
  });
});
