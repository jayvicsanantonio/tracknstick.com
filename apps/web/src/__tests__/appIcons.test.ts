// Checks the app icons: every icon a manifest or index.html names exists at its declared size,
// the home-screen icons are opaque squares of the icon's dark emerald, and the favicon is the same icon.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';
import { describe, it, expect } from 'vitest';

const WEB_ROOT = path.resolve(__dirname, '../..');
const PUBLIC = path.join(WEB_ROOT, 'public');

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

/** The "WIDTHxHEIGHT" of a PNG file, read from its IHDR chunk. */
function pngSize(file: string): string {
  const bytes = readFileSync(file);
  expect(bytes.subarray(1, 4).toString('ascii')).toBe('PNG');
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

/** A PNG's colour type from its IHDR chunk; 2 is RGB, 6 is RGB with alpha. */
function pngColourType(file: string): number {
  return readFileSync(file)[25];
}

/**
 * The red, green and blue of a PNG's top-left pixel. Every PNG row filter
 * leaves the first pixel of the first row unchanged, so it can be read
 * straight from the inflated image data, after the row's filter byte.
 */
function topLeftPixel(file: string): number[] {
  const bytes = readFileSync(file);
  const idat: Buffer[] = [];
  for (let at = 8; at < bytes.length; ) {
    const length = bytes.readUInt32BE(at);
    if (bytes.toString('ascii', at + 4, at + 8) === 'IDAT') {
      idat.push(bytes.subarray(at + 8, at + 8 + length));
    }
    at += length + 12;
  }
  return [...inflateSync(Buffer.concat(idat)).subarray(1, 4)];
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

/** The favicon's source, lower-cased. */
function faviconSvg(): string {
  return readFileSync(
    path.join(PUBLIC, 'icons/favicon.svg'),
    'utf8',
  ).toLowerCase();
}

/** The stops of the favicon's gradient with the given id, in order, as `#rrggbb`. */
function gradientStops(id: string): string[] {
  const gradient = new RegExp(
    `<(linear|radial)gradient id="${id}"[^>]*>([\\s\\S]*?)</\\1gradient>`,
  ).exec(faviconSvg());
  expect(gradient, `gradient #${id}`).not.toBeNull();
  return [
    ...(gradient?.[2] ?? '').matchAll(/stop-color="(#[0-9a-f]{6})"/g),
  ].map((match) => match[1]);
}

/** The icon's solid background colour, as `#rrggbb`. */
function backgroundColour(): string {
  const fill = /<rect [^>]*fill="(#[0-9a-f]{6})"/.exec(faviconSvg())?.[1];
  expect(fill, 'background fill').toBeDefined();
  return fill ?? '';
}

/** The `#rrggbb` of a light-theme colour token in src/styles/index.css. */
function lightThemeColour(token: string): string {
  const css = readFileSync(path.join(WEB_ROOT, 'src/styles/index.css'), 'utf8');
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

describe.each(['manifest.json', 'manifest-dark.json'])('%s', (file) => {
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

  it('links an SVG favicon that exists', () => {
    const href = /rel="icon" href="([^"]+\.svg)"/.exec(html)?.[1];
    expect(href).toBeDefined();
    expect(existsSync(path.join(PUBLIC, href ?? ''))).toBe(true);
  });
});

describe('home-screen icons', () => {
  it.each([
    'apple-touch-icon.png',
    'maskable-192x192.png',
    'maskable-512x512.png',
  ])('%s fills its square to the corners with the emerald glass', (file) => {
    // The corner is lit by the glass's edge highlight, so it is the emerald
    // made a little lighter rather than the plain fill.
    const [red, green, blue] = topLeftPixel(
      path.join(PUBLIC, 'icons', file),
    ).map((channel) => channel.toString(16).padStart(2, '0'));
    const corner = `#${red}${green}${blue}`;
    const { hue, saturation } = hueAndSaturation(corner);
    expect(hue, corner).toBeCloseTo(
      hueAndSaturation(backgroundColour()).hue,
      -1,
    );
    expect(saturation, corner).toBeGreaterThanOrEqual(0.5);
    expect(lightness(corner), corner).toBeGreaterThanOrEqual(
      lightness(backgroundColour()),
    );
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

  // Liquid glass: light catches the rounded edge of the glass, brightest
  // at the top left and again at the bottom right.
  it('lights the edge of the glass with a white specular rim', () => {
    expect(faviconSvg()).toMatch(/<path [^>]*fill="url\(#glass-rim\)"/);
    const stops = gradientStops('glass-rim');
    expect(new Set(stops)).toEqual(new Set(['#ffffff']));
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
