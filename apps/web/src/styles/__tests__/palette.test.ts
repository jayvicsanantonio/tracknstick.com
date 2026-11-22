// Pins the colour contracts of both theme palettes in src/styles/index.css.
// Body text tokens meet WCAG AA contrast, and the destructive colour reads as danger.

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

describe('light palette destructive colour', () => {
  it('is red, as iOS draws a destructive action in either appearance', () => {
    const [hue] = get(light, 'color-destructive');
    expect(hue <= 15 || hue >= 345).toBe(true);
  });

  it('keeps destructive button text readable', () => {
    expect(
      contrast(
        get(light, 'color-destructive-foreground'),
        get(light, 'color-destructive'),
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps destructive text readable on cards', () => {
    expect(
      contrast(get(light, 'color-destructive'), get(light, 'color-card')),
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
