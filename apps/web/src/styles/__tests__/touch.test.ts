// Pins the touch rules in src/styles/index.css that make taps feel like a native iOS app's.
// No grey flash on tap, and controls neither wait for a double-tap zoom nor open the long-press menu.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const css = readFileSync(path.resolve(__dirname, '../index.css'), 'utf8');

/** The declarations of the first rule whose selector list starts with `selector`. */
function rule(selector: string): string {
  const start = css.indexOf(`${selector}`);
  expect(start, `no rule for ${selector}`).toBeGreaterThan(-1);
  const open = css.indexOf('{', start);
  return css.slice(open + 1, css.indexOf('}', open));
}

describe('touch styles', () => {
  it('draws no grey flash where the page is tapped', () => {
    expect(rule('html {')).toMatch(
      /-webkit-tap-highlight-color:\s*transparent/,
    );
  });

  it('keeps the text size iOS chooses when the phone turns sideways', () => {
    const html = rule('html {');
    expect(html).toMatch(/-webkit-text-size-adjust:\s*100%/);
    expect(html).toMatch(/text-size-adjust:\s*100%/);
  });

  describe('controls and the app bars', () => {
    const controls = () => rule('button,');
    const selectors = () =>
      css
        .slice(css.indexOf('button,'), css.indexOf('{', css.indexOf('button,')))
        .split(',')
        .map((s) => s.trim());

    it.each([
      'button',
      'a',
      "[role='button']",
      "[role='tab']",
      'nav',
      'header',
    ])('cover %s', (selector) => {
      expect(selectors()).toContain(selector);
    });

    it('answer a tap at once, without waiting to see if it is a double tap', () => {
      expect(controls()).toMatch(/touch-action:\s*manipulation/);
    });

    it('open no copy menu or text selection on a long press', () => {
      const controlRule = controls();
      expect(controlRule).toMatch(/-webkit-touch-callout:\s*none/);
      expect(controlRule).toMatch(/-webkit-user-select:\s*none/);
      expect(controlRule).toMatch(/(^|[^-])user-select:\s*none/);
    });
  });
});
