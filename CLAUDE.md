# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository or when encountered as a dependency in `node_modules`.

## Overview

`dom-harness` is a lightweight TypeScript library that provides a base `DomHarness` class for building DOM component test harnesses, inspired by Angular CDK's `ComponentHarness`. Consumers extend `DomHarness` to create component-specific harness classes that encapsulate selectors and interactions behind a clean API. Works with any UI framework.

## Usage Guide

### Creating a Harness

Each harness subclass must define either `static testid` (preferred) or `static selector` (raw CSS). The base class uses these to locate elements via `querySelector`/`querySelectorAll`.

```ts
import { DomHarness } from 'dom-harness';

class ButtonHarness extends DomHarness {
  static testid = 'button';                    // maps to [data-testid="button"]
  get button() { return this.root as HTMLButtonElement; }
  async click() { await this.user.click(this.button); }
  text() { return this.button.textContent ?? ''; }
}
```

For elements without `data-testid`, use a raw CSS selector:

```ts
class CardHarness extends DomHarness {
  static selector = '.MuiCard-root';
}
```

### Composing Harnesses

Harnesses nest other harnesses by passing `this.root` as the container argument, scoping child queries to the current component's DOM:

```ts
class LoginFormHarness extends DomHarness {
  static testid = 'login-form';
  get usernameInput() { return TextInputHarness.byName('username', this.root); }
  get submitButton() { return ButtonHarness.first(this.root); }
}
```

### Convenience Finders

Define static methods for common lookups using `find` or `match`:

```ts
class TextInputHarness extends DomHarness {
  static testid = 'text-input';
  static byName(name: string, container?: Element) {
    return this.find(h => h.name() === name, container);
  }
  name() { return (this.root as HTMLInputElement).name; }
}
```

### Using in Tests

```ts
const form = LoginFormHarness.first();
await form.usernameInput.type('testuser');
await form.submitButton.click();
expect(form.welcomeText()).toBe('Welcome, testuser!');
```

## API Quick Reference

**Static properties:** `testid?: string`, `selector?: string` — at least one required on subclasses.

**Static methods** (all return correct subclass type via `this: HarnessConstructor<T>` typing; `container` accepts any `ParentNode` — Element, Document, DocumentFragment, ShadowRoot — and defaults to `document`):
- `first(container?: ParentNode): T` — first matching element, throws if none (error names the class and selector)
- `all(container?: ParentNode): T[]` — all matching elements
- `find(matcher: (el: T) => boolean, container?: ParentNode): T` — first match by predicate, throws if none
- `match(textOrRegexp: string | RegExp, getText: (h: T) => string, container?: ParentNode): T` — match by text/regex
- `fromDomElement(root?: Element | null): T` — wrap existing DOM element, throws if null

**Instance properties:**
- `root: Element` — the wrapped DOM element
- `user: UserEvent` — `@testing-library/user-event` instance, created lazily per harness via `userEvent.setup()` on first access; assignable to share one instance

**Instance methods:**
- `queryElement<E = Element>(selector): E` — descendant query, throws if not found
- `queryElement<E = Element>(selector, true): E | null` — descendant query, returns null if not found

**Types:** `HarnessConstructor<T>` — constructor type of a harness subclass, for helpers that take harness classes.

## Examples

The `examples/` directory contains `TextInput`, `Button`, and `LoginForm` implemented in 6 frameworks (React, Preact, Solid, Vue, Svelte, Angular). The harness code is identical across all — only component rendering differs.

---

## Development

This section is for contributors to the dom-harness library itself.

### Commands

- **Build:** `npm run build` (runs `tsc`; also runs automatically on `npm install` via `prepare`)
- **Test:** `npm test` (runs `vitest run`)
- **Type check:** `npm run typecheck` (runs `tsc --noEmit`, includes tests)
- **Clean:** `npm run clean` (removes `dist/`)
- **Prepare for publish:** `npm run prepublishOnly` (clean + build)

### Git conventions

- Do not add `Co-Authored-By` or `Claude-Session` trailers (or any other AI attribution) to commit messages or PR descriptions. Plain commit messages only.

### Architecture

Single export: `DomHarness` class from `src/DomHarness.ts` → re-exported via `src/index.ts`.

- ESM-only (`"type": "module"`)
- TypeScript strict mode, target ES2022, NodeNext module resolution
- Peer dependency: `@testing-library/user-event` >=14.0.0
- Node >=18 required

### Example Projects

**Structure:** Each example component has its own folder (`text-input/`, `button/`, `login-form/`) containing component, harness, and test files. Vue/Svelte folders include `index.ts` barrel files for named re-exports of SFC default exports.

**Prerequisite:** examples depend on the root package via `"dom-harness": "file:../.."`, which resolves to the root `dist/`. Run `npm install` (or `npm run build`) in the repo root before installing or testing an example, otherwise `dom-harness` fails to resolve.

**Commands per example:**
- `npm test` — runs `vitest run`
- Type check: `npx tsc --noEmit` (react, preact, solid, angular), `npx vue-tsc --noEmit` (vue), `npx svelte-check` (svelte)

**Framework type quirks:**
- Preact: Use `JSX.IntrinsicElements['input']` not `JSX.HTMLAttributes<HTMLInputElement>` (latter lacks `name`, `type`)
- Vue/Svelte: Button `type` prop must be `HTMLButtonElement['type']` not `string`
- Angular: `(ngSubmit)` requires `FormsModule` — child components using `FormsModule` doesn't cover the parent. Use native `(submit)` with `$event.preventDefault()` if parent doesn't import `FormsModule`
- Svelte: Children use `Snippet` type + `{@render children?.()}` pattern; testing children requires a wrapper `.svelte` component

### Gotchas

- `userEvent.setup()` runs lazily per harness instance, not shared — intentional for test isolation. Composed getters (e.g. `form.usernameInput`) create a fresh harness on each access, so keyboard/pointer state does not carry across them; assign a shared `user` if a test needs that
- `testid` values are escaped for `"` and `\` when building the selector; raw `selector` strings are used verbatim
- CI (`.github/workflows/ci.yml`) runs root typecheck + tests on Node 20/22, then installs, type-checks and tests each example
