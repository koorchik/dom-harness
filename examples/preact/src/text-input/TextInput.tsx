import type { JSX } from 'preact';

export function TextInput(props: JSX.IntrinsicElements['input']) {
  return <input data-testid="text-input" {...props} />;
}
