// Pins the colour contracts of both theme palettes in src/styles/index.css.
// Text tokens meet WCAG AA contrast, the destructive colour reads as danger, and medal icons stay visible.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const css = readFileSync(path.resolve(__dirname, '../index.css'), 'utf8');

type Hsl = [hue: number, saturation: number, lightness: number];

/** The `--color-*: hsl(h, s%, l%)` tokens declared in one selector's block. */
function tokens(selector: string): Map<string, Hsl> {
  const start = css.indexOf(`${selector} {`);
  const block = css.slice(start, css.indexOf('}', start));
  const found = new Map<string, Hsl>();
  for (const match of block.matchAll(
    /--(color-[\w-]+): hsl\(([\d.]+), ([\d.]+)%, ([\d.]+)%\)/g,
  )) {
    found.set(match[1], [Number(match[2]), Number(match[3]), Number(match[4])]);
  }
  return found;
}

/** WCAG relative luminance of an HSL colour. */
function luminance([h, s, l]: Hsl): number {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const value = light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(8) + 0.0722 * channel(4);
}

function contrast(a: Hsl, b: Hsl): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

const light = tokens(':root');
const dark = tokens('.dark');
const get = (palette: Map<string, Hsl>, name: string): Hsl => {
  const value = palette.get(name);
  if (!value) throw new Error(`${name} is not declared`);
  return value;
};

describe('light palette', () => {
  it.each([
    'color-text-secondary',
    'color-text-tertiary',
    'color-muted-foreground',
  ])('%s meets 4.5:1 on the background and on cards', (name) => {
    expect(
      contrast(get(light, name), get(light, 'color-background')),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(get(light, name), get(light, 'color-card')),
    ).toBeGreaterThanOrEqual(4.5);
  });
});

describe('dark palette', () => {
  it('uses a red hue for destructive actions', () => {
    const [hue] = get(dark, 'color-destructive');
    expect(hue <= 15 || hue >= 345).toBe(true);
  });

  it('keeps destructive button text readable', () => {
    expect(
      contrast(
        get(dark, 'color-destructive-foreground'),
        get(dark, 'color-destructive'),
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps a destructive icon visible on the background', () => {
    expect(
      contrast(get(dark, 'color-destructive'), get(dark, 'color-background')),
    ).toBeGreaterThanOrEqual(3);
  });
});

describe.each([
  ['light', light],
  ['dark', dark],
])('%s palette solid brand fill', (_theme, palette) => {
  it('keeps small text on it readable', () => {
    expect(
      contrast(
        get(palette, 'color-primary-foreground'),
        get(palette, 'color-brand-solid'),
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });
});

describe.each([
  ['light', light],
  ['dark', dark],
])('%s palette medals', (_theme, palette) => {
  it.each([
    'color-medal-bronze',
    'color-medal-silver',
    'color-medal-gold',
    'color-medal-platinum',
  ])('keeps a medal icon visible on %s', (name) => {
    expect(
      contrast(get(palette, 'color-medal-foreground'), get(palette, name)),
    ).toBeGreaterThanOrEqual(3);
  });

  it('keeps each medal visible on cards', () => {
    for (const name of [
      'color-medal-bronze',
      'color-medal-silver',
      'color-medal-gold',
      'color-medal-platinum',
    ]) {
      expect(
        contrast(get(palette, name), get(palette, 'color-card')),
        name,
      ).toBeGreaterThanOrEqual(1.5);
    }
  });
});
