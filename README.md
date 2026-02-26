# dom-harness

[![npm version](https://badge.fury.io/js/dom-harness.svg)](https://badge.fury.io/js/dom-harness)
[![npm downloads](https://img.shields.io/npm/dm/dom-harness.svg)](https://www.npmjs.com/package/dom-harness)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/dom-harness)](https://bundlephobia.com/package/dom-harness)

A lightweight DOM component test harness library inspired by Angular CDK's `ComponentHarness`. It provides a structured way to interact with rendered DOM components in tests, hiding selector details behind a clean API and making tests more readable and maintainable.

## Why use test harnesses?

- **Encapsulate selectors** — component internals (CSS classes, `data-testid` attributes) live in one place, not scattered across tests.
- **Composable** — harnesses can nest other harnesses, mirroring your component tree.
- **Readable tests** — tests read like user interactions, not DOM traversals.

## Installation

```bash
npm install dom-harness
```

### Peer dependencies

| Package | Version |
|---|---|
| `@testing-library/user-event` | `>=14.0.0` |

## Quick start

### 1. Create a harness

```ts
import { DomHarness } from 'dom-harness';

export class SearchBarHarness extends DomHarness {
  static testid = 'search-bar';

  get input() {
    return this.root.querySelector('input') as HTMLInputElement;
  }

  async type(text: string) {
    await this.user.type(this.input, text);
  }

  value() {
    return this.input.value;
  }
}
```

### 2. Use in a test

```ts
import { render } from '@testing-library/react';
import { SearchBarHarness } from './SearchBarHarness';

it('accepts user input', async () => {
  render(<SearchBar />);

  const harness = SearchBarHarness.first();
  await harness.type('hello');

  expect(harness.value()).toBe('hello');
});
```

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

Harnesses can reference other harnesses for child components:

```ts
class FormHarness extends DomHarness {
  static testid = 'login-form';

  get submitButton() {
    return ButtonHarness.first(this.root);
  }

  get emailField() {
    return InputHarness.find(f => f.label() === 'Email', this.root);
  }
}
```

### Convenience finders with `match`

Define a static convenience method for common lookups:

```ts
class ButtonHarness extends DomHarness {
  static selector = 'button';

  static withText(text: string | RegExp) {
    return this.match(text, b => b.text());
  }

  text() {
    return this.root.textContent ?? '';
  }
}

// Usage
const ok = ButtonHarness.withText('OK');
```

### Selector via CSS class

When `data-testid` is not available, use `selector`:

```ts
class CardHarness extends DomHarness {
  static selector = '.MuiCard-root';
}
```
