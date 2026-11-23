// Checks the app icons: every icon a manifest or index.html names exists at its declared size,
// the home-screen icons are opaque squares of dark emerald, and each theme has a favicon in its own colours.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { THEME_FAVICON } from '@shared/constants/theme';
import { pngColourType, pngSize, topLeftPixel } from '@testing/pngImage';

const WEB_ROOT = path.resolve(__dirname, '../..');
const PUBLIC = path.join(WEB_ROOT, 'public');

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

/** The pixel sizes of the images in an .ico file, from its directory. */
function icoSizes(file: string): number[] {
  const bytes = readFileSync(file);
  const count = bytes.readUInt16LE(4);
  return Array.from({ length: count }, (_, i) => bytes[6 + i * 16] || 256);
}

/** The hue, in degrees, and saturation, from 0 to 1, of a `#rrggbb` colour. */
function hueAndSaturation(hex: string): { hue: number; saturation: number } {
  const [red, green, blue] = [1, 3, 5].map(
    (at) => parseInt(hex.slice(at, at + 2), 16) / 255,
  );
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;
  if (delta !== 0 && max === red) hue = ((green - blue) / delta) % 6;
  else if (delta !== 0 && max === green) hue = (blue - red) / delta + 2;
  else if (delta !== 0) hue = (red - green) / delta + 4;
  return { hue: (hue * 60 + 360) % 360, saturation };
}

/** An SVG icon's source, lower-cased; the app icon's own SVG unless named. */
function faviconSvg(file = 'icons/favicon.svg'): string {
  return readFileSync(path.join(PUBLIC, file), 'utf8').toLowerCase();
}

/** The stops of an SVG icon's gradient with the given id, in order, as `#rrggbb`. */
function gradientStops(id: string, file?: string): string[] {
  const gradient = new RegExp(
    `<(linear|radial)gradient id="${id}"[^>]*>([\\s\\S]*?)</\\1gradient>`,
  ).exec(faviconSvg(file));
  expect(gradient, `gradient #${id}`).not.toBeNull();
  return [
    ...(gradient?.[2] ?? '').matchAll(/stop-color="(#[0-9a-f]{6})"/g),
  ].map((match) => match[1]);
}

/** An SVG icon's solid background colour, as `#rrggbb`. */
function backgroundColour(file?: string): string {
  const fill = /<rect [^>]*fill="(#[0-9a-f]{6})"/.exec(faviconSvg(file))?.[1];
  expect(fill, 'background fill').toBeDefined();
  return fill ?? '';
}

/** The `#rrggbb` of a light-theme colour token in src/styles/index.css. */
function lightThemeColour(token: string): string {
  return themeColour('light', token);
}

/**
 * The `#rrggbb` of a colour token in src/styles/index.css, from the light
 * theme's `:root` block or the dark theme's `.dark` block that follows it.
 */
function themeColour(theme: 'light' | 'dark', token: string): string {
  const stylesheet = readFileSync(
    path.join(WEB_ROOT, 'src/styles/index.css'),
    'utf8',
  );
  const darkBlock = stylesheet.indexOf('.dark {');
  const css =
    theme === 'light'
      ? stylesheet.slice(0, darkBlock)
      : stylesheet.slice(darkBlock);
  const match = new RegExp(
    `--color-${token}: hsl\\((\\d+), (\\d+)%, (\\d+)%\\)`,
  ).exec(css);
  expect(match, token).not.toBeNull();
  const [hue, saturation, lightness] = (match ?? [])
    .slice(1)
    .map(Number)
    .map((value, i) => (i === 0 ? value : value / 100));
  const chroma = saturation * Math.min(lightness, 1 - lightness);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    const value = lightness - chroma * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/** The lightness, from 0 to 1, of a `#rrggbb` colour. */
function lightness(hex: string): number {
  const channels = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
  return (Math.max(...channels) + Math.min(...channels)) / 2 / 255;
}

/** The WCAG contrast ratio between two `#rrggbb` colours. */
function contrastRatio(first: string, second: string): number {
  const luminance = (hex: string) => {
    const [red, green, blue] = [1, 3, 5].map((at) => {
      const value = parseInt(hex.slice(at, at + 2), 16) / 255;
      return value <= 0.03928
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

describe.each(['manifest.json'])('%s', (file) => {
  const { icons } = JSON.parse(
    readFileSync(path.join(PUBLIC, file), 'utf8'),
  ) as { icons: ManifestIcon[] };

  it('names icon files that exist at their declared sizes', () => {
    for (const icon of icons) {
      expect(icon.type).toBe('image/png');
      expect(pngSize(path.join(PUBLIC, icon.src))).toBe(icon.sizes);
    }
  });

  it('offers separate "any" and "maskable" icons at 192 and 512 pixels', () => {
    for (const purpose of ['any', 'maskable']) {
      for (const sizes of ['192x192', '512x512']) {
        expect(icons).toContainEqual(
          expect.objectContaining({ sizes, purpose }),
        );
      }
    }
  });
});

describe('index.html', () => {
  const html = readFileSync(path.join(WEB_ROOT, 'index.html'), 'utf8');

  it('links an Apple touch icon of 180 by 180 pixels', () => {
    const href = /rel="apple-touch-icon" href="([^"]+)"/.exec(html)?.[1];
    expect(href).toBeDefined();
    expect(pngSize(path.join(PUBLIC, href ?? ''))).toBe('180x180');
  });

  it('links one of the themed SVG favicons, which all exist', () => {
    const href = /rel="icon" href="([^"]+\.svg)"/.exec(html)?.[1];
    expect(Object.values(THEME_FAVICON)).toContain(href);
    for (const favicon of Object.values(THEME_FAVICON)) {
      expect(existsSync(path.join(PUBLIC, favicon)), favicon).toBe(true);
    }
  });
});

describe('home-screen icons', () => {
  it.each([
    'apple-touch-icon.png',
    'maskable-192x192.png',
    'maskable-512x512.png',
  ])('%s fills its square to the corners with the plain emerald', (file) => {
    const [red, green, blue] = topLeftPixel(
      path.join(PUBLIC, 'icons', file),
    ).map((channel) => channel.toString(16).padStart(2, '0'));
    expect(`#${red}${green}${blue}`).toBe(backgroundColour());
  });

  // iOS cuts its own rounded shape from the icon and fills any transparent
  // pixels with black, so the Apple touch icon is an opaque square.
  it('ships an Apple touch icon without an alpha channel', () => {
    expect(pngColourType(path.join(PUBLIC, 'icons/apple-touch-icon.png'))).toBe(
      2,
    );
  });
});

describe('favicon', () => {
  it('is one icon in every colour scheme', () => {
    const svg = readFileSync(path.join(PUBLIC, 'icons/favicon.svg'), 'utf8');
    expect(svg).not.toContain('prefers-color-scheme');
  });

  it('fills its background with one dark emerald, not a gradient', () => {
    expect(faviconSvg()).not.toContain('id="background"');

    const fill = backgroundColour();
    const { hue, saturation } = hueAndSaturation(fill);
    expect(hue, fill).toBeGreaterThanOrEqual(145);
    expect(hue, fill).toBeLessThanOrEqual(170);
    expect(saturation, fill).toBeGreaterThanOrEqual(0.8);
    expect(lightness(fill), fill).toBeLessThanOrEqual(0.22);
  });

  it('lays no highlight or blur over the emerald', () => {
    expect(faviconSvg()).not.toMatch(/glass|<filter|#ffffff/);
  });

  it('rounds its corners in the proportion iOS uses for app icons', () => {
    const rx = Number(/<rect [^>]*rx="([\d.]+)"/.exec(faviconSvg())?.[1]);
    expect(rx / 512).toBeCloseTo(0.2237, 2);
  });

  // The ring and check are the Daily Tracker's completed progress ring in
  // the light theme, so they share its gradients and brand colours.
  it('draws the ring in the light theme brand gradient of the Daily Tracker', () => {
    expect(faviconSvg()).toMatch(/<circle [^>]*stroke="url\(#ring\)"/);
    expect(gradientStops('ring')).toEqual([
      lightThemeColour('brand-text-light'),
      lightThemeColour('brand-primary'),
      lightThemeColour('brand-secondary'),
    ]);
  });

  it('draws the check in the light theme brand gradient of the Daily Tracker', () => {
    expect(faviconSvg()).toMatch(/<path [^>]*stroke="url\(#check\)"/);
    expect(gradientStops('check')).toEqual([
      lightThemeColour('brand-primary'),
      lightThemeColour('brand-primary'),
      lightThemeColour('brand-text-light'),
    ]);
  });

  it('fills the dial inside the ring with the light theme pink background', () => {
    expect(faviconSvg()).toMatch(/<circle [^>]*fill="url\(#dial\)"/);
    for (const stop of gradientStops('dial')) {
      const { hue } = hueAndSaturation(stop);
      expect(hue, stop).toBeCloseTo(327, -1);
      expect(lightness(stop), stop).toBeGreaterThanOrEqual(0.9);
    }
  });

  // WCAG 1.4.11 asks 3:1 of graphical objects: the dial stands out from
  // the emerald, and the check from every part of the dial.
  it('sets the dial at 3:1 contrast or more on the emerald', () => {
    for (const dial of gradientStops('dial')) {
      expect(
        contrastRatio(dial, backgroundColour()),
        `${dial} on ${backgroundColour()}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('draws the body of the check at 3:1 contrast or more on the dial', () => {
    const [body] = gradientStops('check');
    for (const dial of gradientStops('dial')) {
      expect(
        contrastRatio(body, dial),
        `${body} on ${dial}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('ships a favicon.ico holding 16, 32 and 48 pixel images', () => {
    expect(icoSizes(path.join(PUBLIC, 'icons/favicon.ico')).sort()).toEqual([
      16, 32, 48,
    ]);
  });
});

// The browser tab's favicon is the Daily Tracker's completed progress ring
// as each theme draws it, on that theme's background: all pink in the light
// theme, emerald on near black in the dark one.
describe.each([
  {
    theme: 'light' as const,
    ring: ['brand-text-light', 'brand-primary', 'brand-secondary'],
    check: ['brand-primary', 'brand-primary', 'brand-text-light'],
  },
  {
    theme: 'dark' as const,
    ring: ['brand-text', 'brand-primary', 'brand-tertiary'],
    check: ['brand-primary', 'brand-primary', 'brand-text'],
  },
])('the $theme theme favicon', ({ theme, ring, check }) => {
  const file = THEME_FAVICON[theme];

  it("fills its rounded square with the theme's background", () => {
    expect(backgroundColour(file)).toBe(themeColour(theme, 'background'));
    const rx = Number(/<rect [^>]*rx="([\d.]+)"/.exec(faviconSvg(file))?.[1]);
    expect(rx / 512).toBeCloseTo(0.2237, 2);
  });

  it("draws the ring in the theme's brand gradient", () => {
    expect(gradientStops('ring', file)).toEqual(
      ring.map((token) => themeColour(theme, token)),
    );
  });

  it("draws the check in the theme's brand gradient", () => {
    expect(gradientStops('check', file)).toEqual(
      check.map((token) => themeColour(theme, token)),
    );
  });

  it('draws the body of the check at 3:1 contrast or more on the dial', () => {
    const [body] = gradientStops('check', file);
    for (const dial of gradientStops('dial', file)) {
      expect(
        contrastRatio(body, dial),
        `${body} on ${dial}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('sets the dial apart from the background', () => {
    for (const dial of gradientStops('dial', file)) {
      expect(dial).not.toBe(backgroundColour(file));
    }
  });
});
