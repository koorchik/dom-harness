import type { ParentProps, JSX } from 'solid-js';

export function Button(props: ParentProps<JSX.ButtonHTMLAttributes<HTMLButtonElement>>) {
  return <button data-testid="button" {...props}>{props.children}</button>;
}
