import { userEvent } from '@testing-library/user-event';

export class DomHarness {
  static testid?: string;
  static selector?: string;

  root: Element;

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

  static fromDomElement<T extends DomHarness>(
    this: { new (root?: Element | null): T; [method: string]: any },
    root?: Element
  ): T {
    return new this(root);
  }

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

  user = userEvent.setup();

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

  queryElement(selector: string): Element;
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
