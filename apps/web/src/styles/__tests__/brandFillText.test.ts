// Keeps text off the plain brand fill, which in the light theme is too pale for small white text.
// Text on a brand fill uses --color-brand-solid; icon-only controls, which need 3:1, may keep the plain fill.

import { describe, it, expect } from 'vitest';

const sources = import.meta.glob<string>(
  ['/src/**/*.{ts,tsx}', '!**/__tests__/**'],
  {
    query: '?raw',
    import: 'default',
    eager: true,
  },
);

/** A class that fills with the plain brand colour, with no opacity. */
const PLAIN_FILL = /bg-\(--color-(?:brand-)?primary\)(?!\/)/;
/** A text colour that is white, or near it, in the light theme. */
const LIGHT_TEXT =
  /text-(?:\(--color-(?:primary-foreground|text-inverse|brand-lighter)\)|white)(?![\w/-])/;

/**
 * The light-theme classes on a line: dark: classes are left out, since the
 * dark brand fill is bright and its text dark.
 */
function lightClasses(line: string): string[] {
  return line
    .split(/[\s'"`]+/)
    .filter(
      (name) => name && !/(^|:)dark:/.test(name) && !name.startsWith('dark:'),
    );
}

/**
 * Files whose plain-filled controls show only an icon: the header's logo
 * mark and + button, the tab bar's + button, the completed habit's badge,
 * the chat's send button, and the chosen tile in the icon picker.
 */
const ICON_ONLY = new Set([
  '/src/features/layout/components/Header.tsx',
  '/src/features/layout/components/MobileTabBar.tsx',
  '/src/features/habits/components/DailyHabitItem.tsx',
  '/src/features/chat/components/ChatInput.tsx',
  '/src/features/habits/components/IconPicker.tsx',
]);

describe('text on the brand fill', () => {
  it('reads the app source', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(50);
  });

  it('puts text only on the solid brand fill', () => {
    const offending = Object.entries(sources)
      .filter(([path]) => !ICON_ONLY.has(path))
      .flatMap(([path, source]) =>
        source
          .split('\n')
          .map((line, index) => ({ path, line: index + 1, text: line }))
          .filter(({ text }) => {
            const classes = lightClasses(text);
            return (
              classes.some((name) => PLAIN_FILL.test(name)) &&
              classes.some((name) => LIGHT_TEXT.test(name))
            );
          })
          .map(({ path: file, line }) => `${file}:${line}`),
      );

    expect(offending).toEqual([]);
  });
});
