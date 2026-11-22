// Pins the keyboard-open variant in src/styles/index.css: styles that apply while the on-screen keyboard is up.
// watchKeyboard marks the root element; the variant styles anything inside it.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const css = readFileSync(path.resolve(__dirname, '../index.css'), 'utf8');

describe('the keyboard-open variant', () => {
  it('applies inside a root element marked while the keyboard is up', () => {
    expect(css).toMatch(
      /@custom-variant keyboard-open \(:root\[data-keyboard-open\] &\);/,
    );
  });
});
