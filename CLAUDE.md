# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`dom-harness` is a lightweight TypeScript library (~110 lines) that provides a base `DomHarness` class for building DOM component test harnesses, inspired by Angular CDK's `ComponentHarness`. Consumers extend `DomHarness` to create component-specific harness classes that encapsulate selectors and interactions behind a clean API.

## Commands

- **Build:** `npm run build` (runs `tsc`)
- **Clean:** `npm run clean` (removes `dist/`)
- **Prepare for publish:** `npm run prepublishOnly` (clean + build)

No test runner or linter is configured in this repo. Tests live in consumer projects.

## Architecture

Single export: `DomHarness` class from `src/DomHarness.ts` → re-exported via `src/index.ts`.

**Subclass contract:** Each harness subclass must define either `static testid` (preferred, maps to `[data-testid='...']`) or `static selector` (raw CSS). The base class uses these to locate elements via `querySelector`/`querySelectorAll`.

**Static methods** (`first`, `all`, `find`, `match`, `fromDomElement`) use `this` typing with generics (`T extends DomHarness`) so they return the correct subclass type when called on subclasses.

**Instance provides:**
- `root: Element` — the wrapped DOM element
- `user: UserEvent` — `@testing-library/user-event` instance (created per harness via `userEvent.setup()`)
- `queryElement(selector, optional?)` — overloaded descendant query with optional null safety

**Composition pattern:** Harnesses nest other harnesses by calling static methods with `this.root` as the container argument (e.g., `ButtonHarness.first(this.root)`).

## Technical Details

- ESM-only (`"type": "module"`)
- TypeScript strict mode, target ES2022, NodeNext module resolution
- Peer dependency: `@testing-library/user-event` >=14.0.0
- Node >=18 required

## Gotchas

- Constructor error message (line 91) calls `DomHarness._getSelector()` which binds to the base class — if a subclass constructor fails, the error message itself may throw because `DomHarness` has no `testid`/`selector`
- `userEvent.setup()` runs per harness instance, not shared — intentional for test isolation but worth knowing if performance matters
