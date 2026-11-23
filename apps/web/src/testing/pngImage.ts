// Reads what the image tests check in a PNG file: its size, colour type and top-left pixel.
// Enough of the format for the app's own icons and launch images, not a general decoder.

import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { expect } from 'vitest';

/** The "WIDTHxHEIGHT" of a PNG file, read from its IHDR chunk. */
export function pngSize(file: string): string {
  const bytes = readFileSync(file);
  expect(bytes.subarray(1, 4).toString('ascii')).toBe('PNG');
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

/** A PNG's colour type from its IHDR chunk; 2 is RGB, 6 is RGB with alpha. */
export function pngColourType(file: string): number {
  return readFileSync(file)[25];
}

/**
 * The red, green and blue of a PNG's top-left pixel. Every PNG row filter
 * leaves the first pixel of the first row unchanged, so it can be read
 * straight from the inflated image data, after the row's filter byte.
 */
export function topLeftPixel(file: string): number[] {
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
