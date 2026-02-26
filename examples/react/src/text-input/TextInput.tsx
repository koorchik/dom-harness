import type { InputHTMLAttributes } from 'react';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input data-testid="text-input" {...props} />;
}
