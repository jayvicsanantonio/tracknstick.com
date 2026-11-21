// Checks the app icons: every icon a manifest or index.html names exists at its declared size,
// the home-screen icons are the light version, and the favicon follows the colour scheme.

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

/** A CSS `hsl(h, s%, l%)` colour as lower-case `#rrggbb`. */
function hslToHex(hsl: string): string {
  const [h, s, l] = (hsl.match(/[\d.]+/g) ?? []).map(Number);
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const value = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
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
  ])('%s fills its square with the light white background', (file) => {
    for (const channel of topLeftPixel(path.join(PUBLIC, 'icons', file))) {
      expect(channel).toBeGreaterThanOrEqual(0xf0);
    }
  });
});

describe('favicon', () => {
  it('switches to its dark version with the colour scheme', () => {
    const svg = readFileSync(path.join(PUBLIC, 'icons/favicon.svg'), 'utf8');
    expect(svg).toContain('@media (prefers-color-scheme: dark)');
  });

  it('is drawn in the light and dark themes’ brand colours', () => {
    const css = readFileSync(
      path.join(WEB_ROOT, 'src/styles/index.css'),
      'utf8',
    );
    const brandColours = [
      ...css.matchAll(/--color-brand-primary: (hsl\([^)]+\))/g),
    ].map((match) => hslToHex(match[1]));
    expect(brandColours).toHaveLength(2);

    const svg = readFileSync(path.join(PUBLIC, 'icons/favicon.svg'), 'utf8');
    for (const colour of brandColours) {
      expect(svg.toLowerCase().includes(colour), `uses ${colour}`).toBe(true);
    }
  });

  it('ships a favicon.ico holding 16, 32 and 48 pixel images', () => {
    expect(icoSizes(path.join(PUBLIC, 'icons/favicon.ico')).sort()).toEqual([
      16, 32, 48,
    ]);
  });
});
