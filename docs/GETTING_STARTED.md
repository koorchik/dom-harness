# Getting Started with dom-harness

## The Problem

You're testing a login form. The test looks like this:

```ts
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

it('should log in successfully', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  const usernameInput = document.querySelector(
    '[data-testid="text-input"][name="username"]'
  ) as HTMLInputElement;
  const passwordInput = document.querySelector(
    '[data-testid="text-input"][name="password"]'
  ) as HTMLInputElement;
  const submitButton = document.querySelector(
    '[data-testid="button"]'
  ) as HTMLButtonElement;

  await user.type(usernameInput, 'testuser');
  await user.type(passwordInput, 'password123');
  await user.click(submitButton);

  const welcome = document.querySelector('[data-testid="welcome"]');
  expect(welcome?.textContent).toBe('Welcome, testuser!');
});

it('should show empty form initially', () => {
  render(<LoginForm />);

  const usernameInput = document.querySelector(
    '[data-testid="text-input"][name="username"]'
  ) as HTMLInputElement;
  const passwordInput = document.querySelector(
    '[data-testid="text-input"][name="password"]'
  ) as HTMLInputElement;
  const welcome = document.querySelector('[data-testid="welcome"]');

  expect(usernameInput.value).toBe('');
  expect(passwordInput.value).toBe('');
  expect(welcome).toBeNull();
});
```

Two tests and you already have:
- **6 `querySelector` calls** with the same selectors copy-pasted
- **Type casts** (`as HTMLInputElement`) scattered everywhere
- **`userEvent.setup()` boilerplate** repeated per test
- **Fragile selectors** — rename `data-testid="text-input"` and both tests break

Now imagine 20 tests. Now imagine the designer wraps the button in a new `<div>`. Every test that touches that button needs updating.

## What is a Test Harness?

A harness is like a **steering wheel for a car** — you don't reach into the engine to turn; you use a clean interface.

A harness wraps a DOM element and exposes what you can *do* with it (click, type, read text) instead of *how* it's built internally. When the markup changes, you update the harness once, and every test keeps working.

Put differently, a harness exposes a component's **capabilities** — the things a user can do with it — without depending on how it's built. If you used Enzyme, think of it like calling component methods (`wrapper.find('Button').simulate('click')`) but on *real rendered DOM* instead of a shallow-rendered tree. If you've used Page Objects, harnesses are the same idea at a finer grain — **per-component** instead of per-page, and **composable**.

Three things a harness is **not**:

- **Not a mock.** Harnesses wrap *real rendered DOM*, fire *real events*, and observe *real state*. Nothing is faked.
- **Not framework-specific.** Pure DOM + TypeScript. The same harness works in React, Vue, Svelte, Angular, Solid, and Preact.
- **Not a replacement for Testing Library.** Works *alongside* it. Uses `@testing-library/user-event` under the hood.

## Harnesses vs. Alternatives

| Approach | Problem |
|----------|---------|
| **Raw DOM selectors** | Selectors duplicated across tests, break on markup changes, poor readability |
| **Enzyme** (deprecated) | React-only, encouraged shallow rendering (fake DOM), no longer maintained |
| **Page Objects** | Page-scoped (not component-scoped), don't compose — no way to nest one inside another with scoped queries. Grow monolithic as pages grow. |
| **Testing Library queries** | Great for one-off queries, but repeated patterns still scatter across files |

Harnesses are the **next step** on top of Testing Library — they DRY up your selectors and interactions into reusable, composable classes.

If you've used Page Objects in Selenium or Playwright, harnesses will feel familiar — both encapsulate selectors behind a class. The difference: Page Objects represent *whole pages* and query the entire document, so they can't nest. Harnesses represent *individual components* and scope queries to `this.root`, so they compose naturally — a `LoginFormHarness` contains a `ButtonHarness` the same way a `<LoginForm>` contains a `<Button>`.

## Your First Harness

Let's build a `ButtonHarness` step by step. Assume you have a `<button data-testid="button">` in your markup.

### Step 1: Start with the raw test

```ts
const user = userEvent.setup();
const button = document.querySelector('[data-testid="button"]') as HTMLButtonElement;

expect(button.textContent).toBe('Click me');
await user.click(button);
expect(onClick).toHaveBeenCalledOnce();
```

### Step 2: Create a harness class

Every harness extends `DomHarness` and defines `static testid` (or `static selector` for raw CSS):

```ts
import { DomHarness } from 'dom-harness';

class ButtonHarness extends DomHarness {
  static testid = 'button'; // maps to [data-testid="button"]
}
```

That's enough to use `ButtonHarness.first()` — it finds the first matching element in the DOM and wraps it.

### Step 3: Add an interaction method

Every harness instance has `this.user` — a `@testing-library/user-event` instance, ready to go. And `this.root` is already the DOM element, so you can use it directly:

```ts
class ButtonHarness extends DomHarness {
  static testid = 'button';

  async click() { await this.user.click(this.root); }
}
```

### Step 4: Add a query method

`textContent` is available on `Element`, so no cast needed:

```ts
class ButtonHarness extends DomHarness {
  static testid = 'button';

  async click() { await this.user.click(this.root); }

  text() { return this.root.textContent ?? ''; }
}
```

### Step 5: Add a convenience finder

The inherited `match()` method takes a string or RegExp and a text-extraction function. Use it to find a button by its visible text:

```ts
class ButtonHarness extends DomHarness {
  static testid = 'button';

  static byText(text: string | RegExp, container?: Element) {
    return this.match(text, h => h.text(), container);
  }

  async click() { await this.user.click(this.root); }

  text() { return this.root.textContent ?? ''; }
}
```

`ButtonHarness.byText('Submit')` finds the first button whose text matches `"Submit"`. Use a regex for partial matches: `ButtonHarness.byText(/sub/i)`.

### Step 6: Rewrite the test

```ts
const button = ButtonHarness.first();

expect(button.text()).toBe('Click me');
await button.click();
expect(onClick).toHaveBeenCalledOnce();
```

No `querySelector`. No type casts. No `userEvent.setup()`. The test reads like a user story.

## Adding a Text Input Harness

Same pattern, slightly more surface area:

```ts
import { DomHarness } from 'dom-harness';

class TextInputHarness extends DomHarness {
  static testid = 'text-input';

  async type(value: string) { await this.user.type(this.root as HTMLInputElement, value); }
  value() { return (this.root as HTMLInputElement).value; }
  name() { return (this.root as HTMLInputElement).name; }
}
```

### Convenience finders

If your page has multiple text inputs, you need a way to find the right one. Add static methods using `find` and `match`:

```ts
class TextInputHarness extends DomHarness {
  static testid = 'text-input';

  static byName(name: string, container?: Element) {
    return this.find(h => h.name() === name, container);
  }

  static byText(text: string | RegExp, container?: Element) {
    return this.match(text, h => (h.root as HTMLInputElement).placeholder, container);
  }

  async type(value: string) { await this.user.type(this.root as HTMLInputElement, value); }
  value() { return (this.root as HTMLInputElement).value; }
  name() { return (this.root as HTMLInputElement).name; }
}
```

`TextInputHarness.byName('username')` finds the first text input whose `name` attribute is `"username"`. `TextInputHarness.byText('Enter your email')` finds one by placeholder text.

## Composing Harnesses

Real components are built from smaller components. Harnesses compose the same way.

Here's a `LoginFormHarness` that reuses `TextInputHarness` and `ButtonHarness`:

```ts
import { DomHarness } from 'dom-harness';
import { TextInputHarness } from '../text-input/TextInputHarness';
import { ButtonHarness } from '../button/ButtonHarness';

class LoginFormHarness extends DomHarness {
  static testid = 'login-form';

  get usernameInput() { return TextInputHarness.byName('username', this.root); }
  get passwordInput() { return TextInputHarness.byName('password', this.root); }
  get submitButton() { return ButtonHarness.first(this.root); }
  get welcomeMessage() { return this.queryElement('[data-testid="welcome"]', true); }

  welcomeText() { return this.welcomeMessage?.textContent ?? null; }
}
```

The key: **`this.root` scoping.** When you pass `this.root` as the `container` argument, child harness queries are scoped to the login form's DOM — not the entire document. This means multiple login forms on the same page won't interfere with each other.

`queryElement` with `true` as the second argument returns `null` instead of throwing when the element isn't found — useful for elements that appear conditionally.

### The full test

```ts
render(<LoginForm />);
const form = LoginFormHarness.first();

expect(form.welcomeText()).toBeNull();

await form.usernameInput.type('testuser');
await form.passwordInput.type('password123');
await form.submitButton.click();

expect(form.welcomeText()).toBe('Welcome, testuser!');
```

Read it out loud: *"Get the form. Type a username. Type a password. Click submit. Expect the welcome text."* That's what a test should look like.

## The Payoff

Imagine you have 5 tests that interact with the login form. Without harnesses, a `data-testid` rename means updating every `querySelector` in every test:

```diff
  // Without harnesses — change this in every test file:
- document.querySelector('[data-testid="text-input"][name="username"]')
+ document.querySelector('[data-testid="form-field"][name="username"]')
```

With harnesses, you change **one line** in the harness:

```diff
  class TextInputHarness extends DomHarness {
-   static testid = 'text-input';
+   static testid = 'form-field';
```

Every test that uses `TextInputHarness` keeps working. Zero changes.

### Markup restructuring

A designer wraps each input in a `<div class="field">` container:

```diff
  <form data-testid="login-form">
+   <div class="field">
      <input data-testid="text-input" name="username" />
+   </div>
+   <div class="field">
      <input data-testid="text-input" name="password" />
+   </div>
    <button data-testid="button">Log in</button>
  </form>
```

Raw tests that relied on structural selectors like `.form > input` or element ordering break. Harness tests don't notice — they call `form.usernameInput` and get back a `TextInputHarness`. *How* that harness locates the element — `data-testid`, `name` attribute, DOM structure — is an implementation detail hidden inside the harness. The markup changed, but the search strategy is the harness's problem, not the test's.

### Interaction changes

A "Delete" button on each todo item used to delete immediately on click. The team adds a confirmation dialog — now clicking opens a dialog, and the user must click "Confirm" to proceed. Every raw test that clicked the delete button and expected the item to be gone now fails — the click just opens the dialog.

With a harness, you update one method:

```diff
  class TodoItemHarness extends DomHarness {
    static testid = 'todo-item';

    async runDelete() {
      const btn = this.queryElement('[data-testid="delete-button"]');
      await this.user.click(btn);
+     const confirm = document.querySelector('[data-testid="confirm-button"]')!;
+     await this.user.click(confirm);
    }
  }
```

Tests still say `await todo.runDelete()`. Zero test changes.

### Multiple instances

A page has 3 buttons. With raw DOM you write:

```ts
const buttons = document.querySelectorAll('[data-testid="button"]');
const submitButton = Array.from(buttons).find(
  b => b.textContent === 'Submit'
) as HTMLButtonElement;
```

With a harness:

```ts
const submitButton = ButtonHarness.byText('Submit');
```

Same for inputs — `TextInputHarness.byName('email')` vs. a multi-line `querySelectorAll` + `Array.from` + `.find()` chain.

### Scoped nesting

A page renders two login forms — "Sign In" and "Sign Up". Raw tests querying from `document` get the wrong one:

```ts
// Grabs the FIRST username input on the page — could be either form
const username = document.querySelector(
  '[data-testid="text-input"][name="username"]'
) as HTMLInputElement;
```

With harnesses, each form's child queries are scoped to `this.root`:

```ts
const [signIn, signUp] = LoginFormHarness.all();

// Each harness queries within its own form — no cross-contamination
await signIn.usernameInput.type('existing-user');
await signUp.usernameInput.type('new-user');
```

`signIn.usernameInput` finds the input *inside the sign-in form*. `signUp.usernameInput` finds the one *inside the sign-up form*. No ambiguity.

This is the same principle behind good APIs: consumers depend on the interface, not the implementation.

## Framework Independence

The harness code is **identical** across frameworks. Only the `render()` call changes:

**React:**
```ts
render(<LoginForm />);
const form = LoginFormHarness.first();
```

**Vue:**
```ts
render(LoginForm);
const form = LoginFormHarness.first();
```

**Solid:**
```ts
render(() => <LoginForm />);
const form = LoginFormHarness.first();
```

**Angular:**
```ts
await render(LoginFormComponent);
const form = LoginFormHarness.first();
```

After the `render()` line, the test is the same in every framework. If your team migrates from React to Vue, your harnesses and test assertions don't change — only the rendering setup does.

See the [`examples/`](../examples/) directory for full working implementations in React, Preact, Solid, Vue, Svelte, and Angular.

For the full API, see the [README](../README.md).
