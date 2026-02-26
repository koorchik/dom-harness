import { userEvent } from '@testing-library/user-event';

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

  /**
   * Returns a harness instance for the first matching element in the DOM (or within `container`).
   * Throws if no element is found.
   *
   * @param container - Optional parent element to scope the query.
   * @returns A harness instance of the calling subclass type.
   */
  static first<T extends DomHarness>(
    this: { new (root?: Element | null): T; [method: string]: any },
    container?: Element
  ): T {
    const selector = this._getSelector();

    const rootElement = container
      ? container.querySelector(selector)
      : document.querySelector(selector);

    return new this(rootElement);
  }

  /**
   * Returns harness instances for all matching elements in the DOM (or within `container`).
   *
   * @param container - Optional parent element to scope the query.
   * @returns An array of harness instances.
   */
  static all<T extends DomHarness>(
    this: { new (root?: Element | null): T; [method: string]: any },
    container?: Element
  ): T[] {
    const selector = this._getSelector();

    const elements = container
      ? container.querySelectorAll(selector)
      : document.querySelectorAll(selector);

    return Array.from(elements).map((el) => new this(el));
  }

  /**
   * Returns the first harness whose instance satisfies `matcher`.
   * Throws if no match is found.
   *
   * @param matcher - Predicate function to test each harness instance.
   * @param container - Optional parent element to scope the query.
   * @returns The first matching harness instance.
   */
  static find<T extends DomHarness>(
    this: { new (root?: Element | null): T; [method: string]: any },
    matcher: (el: T) => boolean,
    container?: Element
  ): T {
    const foundItem = this.all(container).find(matcher);

    if (!foundItem) {
      throw new Error(`Cannot find instance of "${this.name}"`);
    }

    return foundItem;
  }

  /**
   * Convenience wrapper around `find` that matches by text content or regex.
   *
   * @param textOrRegexp - Exact string or regex to match against.
   * @param getText - Function that extracts text from a harness instance.
   * @param container - Optional parent element to scope the query.
   * @returns The first matching harness instance.
   */
  static match<T extends DomHarness>(
    this: { new (root?: Element | null): T; [method: string]: any },
    textOrRegexp: string | RegExp,
    getText: (h: T) => string,
    container?: Element
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
    this: { new (root?: Element | null): T; [method: string]: any },
    root?: Element
  ): T {
    return new this(root);
  }

  /** @internal */
  static _getSelector() {
    const selector = this.testid
      ? `[data-testid='${this.testid}']`
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
   * Created per harness instance via `userEvent.setup()`.
   */
  user = userEvent.setup();

  /**
   * Creates a new harness instance wrapping the given DOM element.
   *
   * @param root - The DOM element to wrap. Throws if null or undefined.
   */
  constructor(root?: Element | null) {
    if (!root) {
      throw new Error(
        `No root for component "${
          this.constructor.name
        }", selector "${DomHarness._getSelector()}"`
      );
    }

    this.root = root;
  }

  /**
   * Queries a descendant of `root` by CSS selector.
   * Throws if no element is found.
   *
   * @param selector - CSS selector string.
   * @returns The matching element.
   */
  queryElement(selector: string): Element;
  /**
   * Queries a descendant of `root` by CSS selector.
   * Returns `null` if no element is found.
   *
   * @param selector - CSS selector string.
   * @param optional - Pass `true` to allow null results.
   * @returns The matching element, or `null` if not found.
   */
  queryElement(selector: string, optional: true): Element | null;
  queryElement(selector: string, optional?: boolean) {
    const element = this.root.querySelector(selector);
    if (!element && !optional)
      throw new Error(
        `Element was not found! Selector=[${selector}] root=[${this.root}]`
      );

    return element;
  }
}
