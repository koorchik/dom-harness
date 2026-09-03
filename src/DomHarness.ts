import { userEvent, type UserEvent } from '@testing-library/user-event';

/**
 * Constructor type of a `DomHarness` subclass. Used as the `this` type of the
 * static finder methods so they return the correct subclass type.
 */
export type HarnessConstructor<T extends DomHarness> = (new (
  root?: Element | null
) => T) &
  typeof DomHarness;

/**
 * Base class for building DOM component test harnesses.
 *
 * Extend this class and define `static testid` or `static selector` to create
 * a harness that encapsulates DOM selectors and interactions behind a clean API.
 *
 * @example
 * ```ts
 * class ButtonHarness extends DomHarness {
 *   static testid = 'button';
 *   get button() { return this.root as HTMLButtonElement; }
 *   async click() { await this.user.click(this.button); }
 *   text() { return this.button.textContent ?? ''; }
 * }
 *
 * const btn = ButtonHarness.first();
 * await btn.click();
 * ```
 */
export class DomHarness {
  /**
   * The `data-testid` value used to locate this component.
   * Maps to the CSS selector `[data-testid="<value>"]`.
   * Preferred over `selector`. At least one of `testid` or `selector` must be defined on subclasses.
   */
  static testid?: string;

  /**
   * Raw CSS selector used to locate this component.
   * Used when `testid` is not set. At least one of `testid` or `selector` must be defined on subclasses.
   */
  static selector?: string;

  /** The underlying DOM element wrapped by this harness. */
  root: Element;

  #user?: UserEvent;

  /**
   * Returns a harness instance for the first matching element in the DOM (or within `container`).
   * Throws if no element is found.
   *
   * @param container - Optional parent node (element, document, fragment or shadow root) to scope the query. Defaults to `document`.
   * @returns A harness instance of the calling subclass type.
   */
  static first<T extends DomHarness>(
    this: HarnessConstructor<T>,
    container: ParentNode = document
  ): T {
    return new this(container.querySelector(this._getSelector()));
  }

  /**
   * Returns harness instances for all matching elements in the DOM (or within `container`).
   *
   * @param container - Optional parent node to scope the query. Defaults to `document`.
   * @returns An array of harness instances.
   */
  static all<T extends DomHarness>(
    this: HarnessConstructor<T>,
    container: ParentNode = document
  ): T[] {
    const elements = container.querySelectorAll(this._getSelector());
    return Array.from(elements, (el) => new this(el));
  }

  /**
   * Returns the first harness whose instance satisfies `matcher`.
   * Throws if no match is found.
   *
   * @param matcher - Predicate function to test each harness instance.
   * @param container - Optional parent node to scope the query. Defaults to `document`.
   * @returns The first matching harness instance.
   */
  static find<T extends DomHarness>(
    this: HarnessConstructor<T>,
    matcher: (el: T) => boolean,
    container: ParentNode = document
  ): T {
    const foundItem = this.all(container).find(matcher);

    if (!foundItem) {
      const scope = container === document ? '' : ' within container';
      throw new Error(
        `Cannot find instance of "${this.name}" (selector "${this._getSelector()}"${scope})`
      );
    }

    return foundItem;
  }

  /**
   * Convenience wrapper around `find` that matches by text content or regex.
   *
   * @param textOrRegexp - Exact string or regex to match against.
   * @param getText - Function that extracts text from a harness instance.
   * @param container - Optional parent node to scope the query. Defaults to `document`.
   * @returns The first matching harness instance.
   */
  static match<T extends DomHarness>(
    this: HarnessConstructor<T>,
    textOrRegexp: string | RegExp,
    getText: (h: T) => string,
    container: ParentNode = document
  ): T {
    return this.find((h: T) => {
      const text = getText(h);
      return textOrRegexp instanceof RegExp
        ? textOrRegexp.test(text)
        : text === textOrRegexp;
    }, container);
  }

  /**
   * Wraps an existing DOM element in a harness, bypassing selector lookup.
   *
   * @param root - The DOM element to wrap.
   * @returns A harness instance wrapping the given element.
   */
  static fromDomElement<T extends DomHarness>(
    this: HarnessConstructor<T>,
    root?: Element | null
  ): T {
    return new this(root);
  }

  /** @internal */
  static _getSelector(): string {
    const selector = this.testid
      ? `[data-testid="${this.testid.replace(/["\\]/g, '\\$&')}"]`
      : this.selector;

    if (!selector) {
      throw new Error(
        'Please add "static testid" or "static selector" to Harness'
      );
    }

    return selector;
  }

  /**
   * A `@testing-library/user-event` instance for simulating user interactions.
   * Created lazily per harness instance via `userEvent.setup()` on first access.
   * Assign to it to share a pre-configured instance across harnesses.
   */
  get user(): UserEvent {
    return (this.#user ??= userEvent.setup());
  }

  set user(value: UserEvent) {
    this.#user = value;
  }

  /**
   * Creates a new harness instance wrapping the given DOM element.
   *
   * @param root - The DOM element to wrap. Throws if null or undefined.
   */
  constructor(root?: Element | null) {
    if (!root) {
      const ctor = this.constructor as typeof DomHarness;
      const selector =
        ctor.testid || ctor.selector ? ctor._getSelector() : '(none)';
      throw new Error(
        `No root for component "${ctor.name}", selector "${selector}"`
      );
    }

    this.root = root;
  }

  /**
   * Queries a descendant of `root` by CSS selector.
   * Throws if no element is found.
   *
   * @typeParam E - Expected element type, e.g. `HTMLInputElement`.
   * @param selector - CSS selector string.
   * @returns The matching element.
   */
  queryElement<E extends Element = Element>(selector: string): E;
  /**
   * Queries a descendant of `root` by CSS selector.
   * Returns `null` if no element is found.
   *
   * @typeParam E - Expected element type, e.g. `HTMLInputElement`.
   * @param selector - CSS selector string.
   * @param optional - Pass `true` to allow null results.
   * @returns The matching element, or `null` if not found.
   */
  queryElement<E extends Element = Element>(
    selector: string,
    optional: true
  ): E | null;
  queryElement(selector: string, optional?: boolean): Element | null {
    const element = this.root.querySelector(selector);
    if (!element && !optional)
      throw new Error(
        `Element was not found! Selector=[${selector}] root=[${this.root}]`
      );

    return element;
  }
}
