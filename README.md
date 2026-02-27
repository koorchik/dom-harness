# dom-harness

[![npm version](https://badge.fury.io/js/dom-harness.svg)](https://badge.fury.io/js/dom-harness)
[![npm downloads](https://img.shields.io/npm/dm/dom-harness.svg)](https://www.npmjs.com/package/dom-harness)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/dom-harness)](https://bundlephobia.com/package/dom-harness)

A lightweight DOM component test harness library inspired by Angular CDK's `ComponentHarness`. It provides a structured way to interact with rendered DOM components in tests, hiding selector details behind a clean API and making tests more readable and maintainable.

**New here?** Read the [Getting Started guide](docs/GETTING_STARTED.md) for a step-by-step tutorial.

## Why use test harnesses?

Tests that query the DOM directly are fragile — selectors are scattered across test files, interaction boilerplate is duplicated, and any markup change ripples through every test that touches the component. A harness encapsulates all of that in one place so tests read like user interactions, not DOM traversals.

**Without harnesses** — selectors and interactions leak into every test:

```ts
it('should show welcome message after login', async () => {
  render(<LoginForm />);
  const user = userEvent.setup();

  const form = document.querySelector('[data-testid="login-form"]')!;
  const inputs = form.querySelectorAll('[data-testid="text-input"]');
  const username = [...inputs].find(el => (el as HTMLInputElement).name === 'username')! as HTMLInputElement;
  const password = [...inputs].find(el => (el as HTMLInputElement).name === 'password')! as HTMLInputElement;
  const button = form.querySelector('[data-testid="button"]')! as HTMLButtonElement;

  await user.type(username, 'testuser');
  await user.type(password, 'password123');
  await user.click(button);

  expect(form.querySelector('[data-testid="welcome"]')!.textContent).toBe('Welcome, testuser!');
});
```

**With harnesses** — the same test, readable and resilient to markup changes:

```ts
it('should show welcome message after login', async () => {
  render(<LoginForm />);
  const form = LoginFormHarness.first();

  await form.usernameInput.type('testuser');
  await form.passwordInput.type('password123');
  await form.submitButton.click();

  expect(form.welcomeText()).toBe('Welcome, testuser!');
});
```

## Installation

```bash
npm install dom-harness
```

### Peer dependencies

| Package | Version |
|---|---|
| `@testing-library/user-event` | `>=14.0.0` |

## Quick start

### 1. Create leaf harnesses

```ts
import { DomHarness } from 'dom-harness';

export class TextInputHarness extends DomHarness {
  static testid = 'text-input';
  get input() { return this.root as HTMLInputElement; }
  static byName(name: string, container?: Element) { return this.find(h => h.name() === name, container); }
  async type(value: string) { await this.user.type(this.input, value); }
  value() { return this.input.value; }
  name() { return this.input.name; }
}

export class ButtonHarness extends DomHarness {
  static testid = 'button';
  get button() { return this.root as HTMLButtonElement; }
  async click() { await this.user.click(this.button); }
  text() { return this.button.textContent ?? ''; }
}
```

### 2. Compose into a form harness

```ts
import { DomHarness } from 'dom-harness';
import { TextInputHarness } from '../text-input/TextInputHarness';
import { ButtonHarness } from '../button/ButtonHarness';

export class LoginFormHarness extends DomHarness {
  static testid = 'login-form';

  get usernameInput() { return TextInputHarness.byName('username', this.root); }
  get passwordInput() { return TextInputHarness.byName('password', this.root); }
  get submitButton() { return ButtonHarness.first(this.root); }
  get welcomeMessage() { return this.queryElement('[data-testid="welcome"]', true); }

  welcomeText() { return this.welcomeMessage?.textContent ?? null; }
}
```

### 3. Use in a test

```ts
import { render } from '@testing-library/react';
import { LoginFormHarness } from './LoginFormHarness';

it('should show welcome message after login', async () => {
  render(<LoginForm />);
  const form = LoginFormHarness.first();

  await form.usernameInput.type('testuser');
  await form.passwordInput.type('password123');
  await form.submitButton.click();

  expect(form.welcomeText()).toBe('Welcome, testuser!');
});
```

## Examples

The `examples/` directory contains the same `TextInput`, `Button`, and `LoginForm` components implemented in 6 frameworks. The harness code is identical across all of them — only the component rendering differs.

```
examples/
  react/     — React 19
  preact/    — Preact 10
  solid/     — Solid 1.9
  vue/       — Vue 3.5
  svelte/    — Svelte 5
  angular/   — Angular 19
```

Each example runs tests with `npm test` (vitest).

## API reference

### Static properties

| Property | Type | Description |
|---|---|---|
| `testid` | `string \| undefined` | Maps to `[data-testid="<value>"]` selector. |
| `selector` | `string \| undefined` | Raw CSS selector. Used when `testid` is not set. |

At least one of `testid` or `selector` must be defined on a harness subclass.

### Static methods

#### `first(container?: Element): T`

Returns a harness instance for the **first** matching element in the DOM (or within `container`).

```ts
const btn = ButtonHarness.first();
```

#### `all(container?: Element): T[]`

Returns harness instances for **all** matching elements.

```ts
const buttons = ButtonHarness.all();
expect(buttons).toHaveLength(3);
```

#### `find(matcher: (el: T) => boolean, container?: Element): T`

Returns the first harness whose instance satisfies `matcher`. Throws if no match is found.

```ts
const submit = ButtonHarness.find(b => b.text() === 'Submit');
```

#### `match(textOrRegexp: string | RegExp, getText: (h: T) => string, container?: Element): T`

Convenience wrapper around `find` that matches by text content or regex.

```ts
const cancel = ButtonHarness.match('Cancel', b => b.text());
const save = ButtonHarness.match(/save/i, b => b.text());
```

#### `fromDomElement(root?: Element): T`

Wraps an existing DOM element in a harness, bypassing selector lookup.

```ts
const el = document.querySelector('.my-button')!;
const btn = ButtonHarness.fromDomElement(el);
```

### Instance properties and methods

#### `root: Element`

The underlying DOM element for this harness.

#### `user: UserEvent`

A `@testing-library/user-event` instance for simulating user interactions.

```ts
await harness.user.click(harness.root);
```

#### `queryElement(selector: string): Element`

Queries a descendant of `root` by CSS selector. Throws if no element is found. In practice, most harnesses use `this.root.querySelector(...)` directly for more control over null handling.

```ts
const icon = this.root.querySelector('.icon');
```

## Patterns

### Composing harnesses

Harnesses can reference other harnesses for child components. Pass `this.root` as the container to scope queries to the current component's DOM:

```ts
class LoginFormHarness extends DomHarness {
  static testid = 'login-form';

  get usernameInput() { return TextInputHarness.byName('username', this.root); }
  get passwordInput() { return TextInputHarness.byName('password', this.root); }
  get submitButton() { return ButtonHarness.first(this.root); }
}
```

### Convenience finders

Define static methods for common lookups. `match` works well for text-based matching, while `find` handles arbitrary predicates:

```ts
class ButtonHarness extends DomHarness {
  static selector = 'button';

  static withText(text: string | RegExp) {
    return this.match(text, b => b.text());
  }

  text() { return this.root.textContent ?? ''; }
}

// Usage
const ok = ButtonHarness.withText('OK');
```

```ts
class TextInputHarness extends DomHarness {
  static testid = 'text-input';

  static byName(name: string, container?: Element) {
    return this.find(h => h.name() === name, container);
  }

  name() { return (this.root as HTMLInputElement).name; }
}

// Usage
const email = TextInputHarness.byName('email');
```

### Selector via CSS class

When `data-testid` is not available, use `selector`:

```ts
class CardHarness extends DomHarness {
  static selector = '.MuiCard-root';
}
```
