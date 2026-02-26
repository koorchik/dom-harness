import { describe, it, expect, beforeEach } from 'vitest';
import { DomHarness } from './DomHarness.js';

// --- Test harness stubs ---

class WidgetHarness extends DomHarness {
  static testid = 'widget';
}

class TagHarness extends DomHarness {
  static selector = '.tag';
}

class BothHarness extends DomHarness {
  static testid = 'both';
  static selector = '.both';
}

class EmptyHarness extends DomHarness {}

class InputHarness extends DomHarness {
  static testid = 'input';
  get input() { return this.root as HTMLInputElement; }
  static byName(name: string, container?: Element) {
    return this.find(h => h.name() === name, container);
  }
  async type(value: string) { await this.user.type(this.input, value); }
  value() { return this.input.value; }
  name() { return this.input.name; }
}

class BtnHarness extends DomHarness {
  static testid = 'btn';
  get button() { return this.root as HTMLButtonElement; }
  async click() { await this.user.click(this.button); }
  text() { return this.button.textContent ?? ''; }
  isDisabled() { return this.button.disabled; }
}

class FormHarness extends DomHarness {
  static testid = 'form';
  get username() { return InputHarness.byName('username', this.root); }
  get password() { return InputHarness.byName('password', this.root); }
  get submitBtn() { return BtnHarness.first(this.root); }
}

// --- Helpers ---

function setBody(html: string) {
  document.body.innerHTML = html;
}

// --- Tests ---

describe('_getSelector', () => {
  it('returns data-testid selector when testid defined', () => {
    expect(WidgetHarness._getSelector()).toBe("[data-testid='widget']");
  });

  it('returns raw CSS when selector defined', () => {
    expect(TagHarness._getSelector()).toBe('.tag');
  });

  it('testid takes priority over selector', () => {
    expect(BothHarness._getSelector()).toBe("[data-testid='both']");
  });

  it('throws when neither defined', () => {
    expect(() => EmptyHarness._getSelector()).toThrow(
      'Please add "static testid" or "static selector" to Harness'
    );
  });
});

describe('constructor', () => {
  it('assigns root when given valid Element', () => {
    const el = document.createElement('div');
    const harness = new WidgetHarness(el);
    expect(harness.root).toBe(el);
  });

  it('throws when root is null', () => {
    expect(() => new WidgetHarness(null)).toThrow();
  });

  it('throws when root is undefined', () => {
    expect(() => new WidgetHarness(undefined)).toThrow();
  });
});

describe('user property', () => {
  it('has expected UserEvent methods', () => {
    const el = document.createElement('div');
    const harness = new WidgetHarness(el);
    expect(typeof harness.user.click).toBe('function');
    expect(typeof harness.user.type).toBe('function');
    expect(typeof harness.user.keyboard).toBe('function');
  });

  it('each instance gets its own distinct user', () => {
    const el = document.createElement('div');
    const a = new WidgetHarness(el);
    const b = new WidgetHarness(el);
    expect(a.user).not.toBe(b.user);
  });
});

describe('first', () => {
  beforeEach(() => {
    setBody(`
      <div data-testid="widget">one</div>
      <div data-testid="widget">two</div>
    `);
  });

  it('returns harness wrapping first match', () => {
    const h = WidgetHarness.first();
    expect(h).toBeInstanceOf(WidgetHarness);
    expect(h.root.textContent).toBe('one');
  });

  it('scopes to container when provided', () => {
    setBody(`
      <div id="outer"><div data-testid="widget">outer</div></div>
      <div id="inner"><div data-testid="widget">inner</div></div>
    `);
    const container = document.getElementById('inner')!;
    const h = WidgetHarness.first(container);
    expect(h.root.textContent).toBe('inner');
  });

  it('throws when no match found', () => {
    setBody('');
    expect(() => WidgetHarness.first()).toThrow();
  });

  it('works with raw selector (not just testid)', () => {
    setBody('<span class="tag">hello</span>');
    const h = TagHarness.first();
    expect(h.root.textContent).toBe('hello');
  });
});

describe('all', () => {
  it('returns array of all matches', () => {
    setBody(`
      <div data-testid="widget">a</div>
      <div data-testid="widget">b</div>
      <div data-testid="widget">c</div>
    `);
    const items = WidgetHarness.all();
    expect(items).toHaveLength(3);
  });

  it('returns empty array when no matches', () => {
    setBody('');
    expect(WidgetHarness.all()).toEqual([]);
  });

  it('scopes to container', () => {
    setBody(`
      <div id="a"><div data-testid="widget">1</div></div>
      <div id="b"><div data-testid="widget">2</div><div data-testid="widget">3</div></div>
    `);
    const container = document.getElementById('b')!;
    expect(WidgetHarness.all(container)).toHaveLength(2);
  });

  it('returns instances of the subclass', () => {
    setBody('<div data-testid="widget">x</div>');
    const items = WidgetHarness.all();
    expect(items[0]).toBeInstanceOf(WidgetHarness);
  });
});

describe('find', () => {
  beforeEach(() => {
    setBody(`
      <div data-testid="widget">alpha</div>
      <div data-testid="widget">beta</div>
    `);
  });

  it('returns first harness matching predicate', () => {
    const h = WidgetHarness.find((w) => w.root.textContent === 'beta');
    expect(h.root.textContent).toBe('beta');
  });

  it('throws when predicate matches nothing', () => {
    expect(() =>
      WidgetHarness.find((w) => w.root.textContent === 'nope')
    ).toThrow('Cannot find instance of "WidgetHarness"');
  });

  it('throws when DOM has no elements at all', () => {
    setBody('');
    expect(() => WidgetHarness.find(() => true)).toThrow();
  });
});

describe('match', () => {
  beforeEach(() => {
    setBody(`
      <div data-testid="widget">Save</div>
      <div data-testid="widget">Cancel</div>
    `);
  });

  it('matches by exact string', () => {
    const h = WidgetHarness.match('Cancel', (w) => w.root.textContent!);
    expect(h.root.textContent).toBe('Cancel');
  });

  it('matches by RegExp', () => {
    const h = WidgetHarness.match(/^Sav/, (w) => w.root.textContent!);
    expect(h.root.textContent).toBe('Save');
  });

  it('throws when no match (string)', () => {
    expect(() =>
      WidgetHarness.match('Delete', (w) => w.root.textContent!)
    ).toThrow();
  });

  it('string matching is exact, not substring', () => {
    expect(() =>
      WidgetHarness.match('Canc', (w) => w.root.textContent!)
    ).toThrow();
  });
});

describe('fromDomElement', () => {
  it('wraps an existing element', () => {
    const el = document.createElement('div');
    const h = WidgetHarness.fromDomElement(el);
    expect(h).toBeInstanceOf(WidgetHarness);
    expect(h.root).toBe(el);
  });

  it('throws when element is undefined', () => {
    expect(() => WidgetHarness.fromDomElement(undefined)).toThrow();
  });
});

describe('queryElement', () => {
  let harness: WidgetHarness;

  beforeEach(() => {
    setBody(`
      <div data-testid="widget">
        <span class="label">Hello</span>
      </div>
    `);
    harness = WidgetHarness.first();
  });

  it('returns descendant (required mode)', () => {
    const el = harness.queryElement('.label');
    expect(el.textContent).toBe('Hello');
  });

  it('throws when not found (required mode)', () => {
    expect(() => harness.queryElement('.missing')).toThrow(
      'Element was not found!'
    );
  });

  it('returns null when not found (optional mode)', () => {
    expect(harness.queryElement('.missing', true)).toBeNull();
  });

  it('returns descendant (optional mode, element exists)', () => {
    const el = harness.queryElement('.label', true);
    expect(el!.textContent).toBe('Hello');
  });
});

// --- Integration tests ---

function setupLoginForm() {
  setBody(`
    <form data-testid="form">
      <input data-testid="input" name="username" />
      <input data-testid="input" name="password" type="password" />
      <button data-testid="btn" type="submit">Log in</button>
      <span data-testid="message" hidden></span>
    </form>
  `);
  const form = document.querySelector('form')!;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = (form.querySelector('[name="username"]') as HTMLInputElement).value;
    const msg = form.querySelector('[data-testid="message"]')!;
    msg.textContent = `Welcome, ${username}!`;
    msg.removeAttribute('hidden');
  });
}

describe('integration', () => {
  beforeEach(() => setupLoginForm());

  it('types into an input', async () => {
    const h = InputHarness.first();
    await h.type('hello');
    expect(h.value()).toBe('hello');
  });

  it('clicks a button', async () => {
    let clicked = false;
    BtnHarness.first().button.addEventListener('click', () => { clicked = true; });
    await BtnHarness.first().click();
    expect(clicked).toBe(true);
  });

  it('form harness accesses child harnesses', () => {
    const form = FormHarness.first();
    expect(form.username).toBeInstanceOf(InputHarness);
    expect(form.password).toBeInstanceOf(InputHarness);
    expect(form.submitBtn).toBeInstanceOf(BtnHarness);
  });

  it('byName finds correct input', () => {
    const form = FormHarness.first();
    expect(form.username.name()).toBe('username');
    expect(form.password.name()).toBe('password');
  });

  it('end-to-end: fill form and submit', async () => {
    const form = FormHarness.first();
    await form.username.type('alice');
    await form.password.type('secret');
    await form.submitBtn.click();

    const msg = document.querySelector('[data-testid="message"]')!;
    expect(msg.textContent).toBe('Welcome, alice!');
    expect(msg.hasAttribute('hidden')).toBe(false);
  });

  it('accessor methods return expected values', () => {
    expect(BtnHarness.first().text()).toBe('Log in');
    expect(BtnHarness.first().isDisabled()).toBe(false);
    expect(InputHarness.byName('password').name()).toBe('password');
  });
});
