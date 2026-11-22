// Keeps background blur to the app's bars and sheets, as iOS uses it, for smooth scrolling on older iPhones.
// Each blurred element costs the phone a redraw of what is behind it on every frame it scrolls.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC = path.resolve(__dirname, '../..');

/** The files allowed to blur what is behind them: bars, sheets and the banner. */
const BARS_AND_SHEETS = [
  'features/layout/components/Header.tsx',
  'features/layout/components/MobileTabBar.tsx',
  'features/habits/components/HabitDialog.tsx',
  'shared/components/ui/toast.tsx',
];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const full = path.join(directory, name);
    if (statSync(full).isDirectory()) {
      return name === '__tests__' ? [] : sourceFiles(full);
    }
    return /\.tsx?$/.test(name) ? [full] : [];
  });
}

describe('background blur', () => {
  it('is used only by the bars, the sheets and the banner', () => {
    const blurring = sourceFiles(SRC)
      .filter((file) =>
        /backdrop-(blur|saturate|brightness)/.test(readFileSync(file, 'utf8')),
      )
      .map((file) => path.relative(SRC, file));

    expect(blurring.sort()).toEqual([...BARS_AND_SHEETS].sort());
  });
});
