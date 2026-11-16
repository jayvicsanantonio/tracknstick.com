// Runs public/applyStoredTheme.js, which index.html loads before first paint.
// It sets the stored theme's class on <html>, and dark when none is stored.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, it, expect } from 'vitest';
import { THEME_STORAGE_KEY } from '@shared/constants/theme';

const script = readFileSync(
  path.resolve(__dirname, '../../public/applyStoredTheme.js'),
  'utf8',
);

/** Runs the file the way index.html does: as a classic script element. */
function runScript() {
  const element = document.createElement('script');
  element.textContent = script;
  document.head.append(element);
  element.remove();
}

const root = document.documentElement;

afterEach(() => {
  root.classList.remove('light', 'dark');
  localStorage.clear();
});

describe('applyStoredTheme.js', () => {
  it.each(['light', 'dark'])('applies a stored %s theme', (mode) => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);

    runScript();

    expect(root.classList.contains(mode)).toBe(true);
  });

  it('applies the dark theme when none is stored', () => {
    runScript();

    expect(root.classList.contains('dark')).toBe(true);
  });

  it('applies the dark theme when the stored value is not a theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');

    runScript();

    expect(root.classList.contains('dark')).toBe(true);
    expect(root.classList.contains('sepia')).toBe(false);
  });
});
