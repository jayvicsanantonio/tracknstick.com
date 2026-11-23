// Runs public/applyStoredTheme.js, which index.html loads before first paint.
// It applies an explicit stored theme, or resolves the OS colour scheme when set
// to system / unset / invalid, and keeps <meta name="theme-color"> and the favicon synced.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, it, expect } from 'vitest';
import {
  THEME_CHROME_COLOR,
  THEME_FAVICON,
  THEME_STORAGE_KEY,
} from '@shared/constants/theme';

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

/** Sets window.matchMedia inside jsdom's classic script realm so <script> sees it. */
function setScriptMatchMedia(darkMatches: boolean | undefined) {
  const element = document.createElement('script');
  element.textContent =
    darkMatches === undefined
      ? 'delete window.matchMedia;'
      : `window.matchMedia = function (q) { return { matches: q === '(prefers-color-scheme: dark)' ? ${String(darkMatches)} : false }; };`;
  document.head.append(element);
  element.remove();
}

const root = document.documentElement;

afterEach(() => {
  root.classList.remove('light', 'dark');
  root.style.colorScheme = '';
  document.querySelector('meta[name="theme-color"]')?.remove();
  document.querySelector('link[rel="icon"]')?.remove();
  localStorage.clear();
  setScriptMatchMedia(undefined);
});

describe('applyStoredTheme.js', () => {
  it.each(['light', 'dark'] as const)(
    'applies a stored %s theme and syncs theme-color',
    (mode) => {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.append(meta);
      localStorage.setItem(THEME_STORAGE_KEY, mode);

      runScript();

      expect(root.classList.contains(mode)).toBe(true);
      expect(root.style.colorScheme).toBe(mode);
      expect(meta.content).toBe(THEME_CHROME_COLOR[mode]);
    },
  );

  it.each(['light', 'dark'] as const)(
    'shows the %s theme favicon before first paint',
    (mode) => {
      const icon = document.createElement('link');
      icon.rel = 'icon';
      document.head.append(icon);
      localStorage.setItem(THEME_STORAGE_KEY, mode);

      runScript();

      expect(icon.getAttribute('href')).toBe(THEME_FAVICON[mode]);
    },
  );

  it('follows the system colour scheme when none is stored', () => {
    setScriptMatchMedia(true);
    runScript();
    expect(root.classList.contains('dark')).toBe(true);

    root.classList.remove('light', 'dark');
    setScriptMatchMedia(false);
    runScript();
    expect(root.classList.contains('light')).toBe(true);
  });

  it('falls back to the system colour scheme when the stored value is invalid', () => {
    setScriptMatchMedia(true);
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');

    runScript();

    expect(root.classList.contains('dark')).toBe(true);
    expect(root.classList.contains('sepia')).toBe(false);
  });
});
