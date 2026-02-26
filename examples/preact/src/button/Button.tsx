import type { JSX } from 'preact';
import type { ComponentChildren } from 'preact';

export function Button({ children, ...props }: JSX.IntrinsicElements['button'] & { children?: ComponentChildren }) {
  return <button data-testid="button" {...props}>{children}</button>;
}
