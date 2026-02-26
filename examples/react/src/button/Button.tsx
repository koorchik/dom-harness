import type { ButtonHTMLAttributes } from 'react';

export function Button({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button data-testid="button" {...props}>{children}</button>;
}
