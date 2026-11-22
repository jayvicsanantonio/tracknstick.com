// Runs public/applyStoredTheme.js, which index.html loads before first paint.
// It sets the chosen appearance's class on <html>, or the system's when none is chosen.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, it, expect } from 'vitest';
import { THEME_STORAGE_KEY } from '@shared/constants/theme';

const script = readFileSync(
  path.resolve(__dirname, '../../public/applyStoredTheme.js'),
  'utf8',
);

let systemDark = false;

/**
 * Runs the file's code with a window whose system appearance the test sets;
 * jsdom has no matchMedia of its own.
 */
function runScript() {
  const fakeWindow = {
    matchMedia: (query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' && systemDark,
    }),
  };
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const apply = new Function('window', 'document', 'localStorage', script) as (
    window: unknown,
    document: Document,
    localStorage: Storage,
  ) => void;
  apply(fakeWindow, document, localStorage);
}

const root = document.documentElement;

function systemIsDark(dark: boolean) {
  systemDark = dark;
}

afterEach(() => {
  root.classList.remove('light', 'dark');
  localStorage.clear();
});

describe('applyStoredTheme.js', () => {
  it.each(['light', 'dark'])('applies a chosen %s appearance', (mode) => {
    systemIsDark(mode === 'light');
    localStorage.setItem(THEME_STORAGE_KEY, mode);

    runScript();

    expect(root.classList.contains(mode)).toBe(true);
  });

  it.each([
    [true, 'dark'],
    [false, 'light'],
  ])('follows the system when nothing is chosen (dark: %s)', (dark, mode) => {
    systemIsDark(dark);

    runScript();

    expect(root.classList.contains(mode)).toBe(true);
  });

  it('follows the system when the stored value is not an appearance', () => {
    systemIsDark(false);
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');

    runScript();

    expect(root.classList.contains('light')).toBe(true);
    expect(root.classList.contains('sepia')).toBe(false);
  });
});
