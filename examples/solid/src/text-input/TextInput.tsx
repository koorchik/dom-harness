import type { JSX } from 'solid-js';

export function TextInput(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  return <input data-testid="text-input" {...props} />;
}
