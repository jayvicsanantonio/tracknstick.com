// Pins the styles of the page behind an iOS-style sheet, which shrinks back into a card while the sheet is open.
// The card carries the page's own background, and the decoration inside it stays visible.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const css = readFileSync(path.resolve(__dirname, '../index.css'), 'utf8');
const app = readFileSync(path.resolve(__dirname, '../../app/App.tsx'), 'utf8');

describe('the page behind a sheet', () => {
  it('is the element the sheet shrinks', () => {
    expect(app).toMatch(/data-vaul-drawer-wrapper=""/);
  });

  it("is drawn with the page's background, so it reads as a card", () => {
    const start = css.indexOf('[data-vaul-drawer-wrapper]');
    const selectors = css.slice(
      css.lastIndexOf('}', start) + 1,
      css.indexOf('{', start),
    );
    const rule = css.slice(css.indexOf('{', start), css.indexOf('}', start));

    expect(selectors).toMatch(/html,\s*body,\s*\[data-vaul-drawer-wrapper\]/);
    expect(rule).toMatch(/background-color:\s*var\(--color-background\)/);
  });

  it('keeps its decoration, drawn behind the content, inside the card', () => {
    const rules = [
      ...css.matchAll(/\[data-vaul-drawer-wrapper\]\s*\{([^}]*)\}/g),
    ].map(([, body]) => body);

    expect(rules.some((body) => /isolation:\s*isolate/.test(body))).toBe(true);
  });
});
