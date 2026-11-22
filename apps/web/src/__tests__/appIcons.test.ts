// Checks the app icons: every icon a manifest or index.html names exists at its declared size,
// the home-screen icons are opaque squares of the icon's emerald, and the favicon is the same icon.

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

/** The icon's background gradient stops, top first, as `#rrggbb`. */
function backgroundStops(): string[] {
  return [...faviconSvg().matchAll(/stop-color="(#[0-9a-f]{6})"/g)].map(
    (match) => match[1],
  );
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
  ])('%s fills its square with the top of the emerald gradient', (file) => {
    const [red, green, blue] = topLeftPixel(
      path.join(PUBLIC, 'icons', file),
    ).map((channel) => channel.toString(16).padStart(2, '0'));
    expect(`#${red}${green}${blue}`).toBe(backgroundStops()[0]);
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

  it('fills its background with an emerald gradient', () => {
    const svg = faviconSvg();
    expect(svg).toMatch(/<rect [^>]*fill="url\(#background\)"/);

    const stops = backgroundStops();
    expect(stops).toHaveLength(2);
    for (const stop of stops) {
      const { hue, saturation } = hueAndSaturation(stop);
      expect(hue, stop).toBeGreaterThanOrEqual(145);
      expect(hue, stop).toBeLessThanOrEqual(170);
      expect(saturation, stop).toBeGreaterThanOrEqual(0.8);
    }
  });

  it('rounds its corners in the proportion iOS uses for app icons', () => {
    const rx = Number(/<rect [^>]*rx="([\d.]+)"/.exec(faviconSvg())?.[1]);
    expect(rx / 512).toBeCloseTo(0.2237, 2);
  });

  // WCAG 1.4.11 asks 3:1 of graphical objects; every gradient stop is
  // checked, so the ring and check meet it wherever they cross.
  it('draws its ring and check at 3:1 contrast or more on every part of the gradient', () => {
    const strokes = [...faviconSvg().matchAll(/stroke="(#[0-9a-f]{6})"/g)].map(
      (match) => match[1],
    );
    expect(strokes).toHaveLength(2);
    for (const stroke of strokes) {
      for (const stop of backgroundStops()) {
        expect(
          contrastRatio(stroke, stop),
          `${stroke} on ${stop}`,
        ).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('ships a favicon.ico holding 16, 32 and 48 pixel images', () => {
    expect(icoSizes(path.join(PUBLIC, 'icons/favicon.ico')).sort()).toEqual([
      16, 32, 48,
    ]);
  });
});
