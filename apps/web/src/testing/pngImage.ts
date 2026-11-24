// Reads what the image tests check in a PNG file: its size, colour type and pixels.
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

/**
 * The red, green and blue of the pixel at `x`, `y` in an 8-bit RGB or RGBA
 * PNG, undoing each row's filter from the top down to `y`.
 */
export function pixelAt(file: string, x: number, y: number): number[] {
  const bytes = readFileSync(file);
  const width = bytes.readUInt32BE(16);
  expect(bytes[24], 'bit depth').toBe(8);
  const channels = { 2: 3, 6: 4 }[bytes[25]];
  expect(channels, 'colour type').toBeDefined();
  const pixelBytes = channels ?? 3;
  const idat: Buffer[] = [];
  for (let at = 8; at < bytes.length; ) {
    const length = bytes.readUInt32BE(at);
    if (bytes.toString('ascii', at + 4, at + 8) === 'IDAT') {
      idat.push(bytes.subarray(at + 8, at + 8 + length));
    }
    at += length + 12;
  }
  const data = inflateSync(Buffer.concat(idat));
  const stride = width * pixelBytes;
  let above = Buffer.alloc(stride);
  let row = Buffer.alloc(stride);
  for (let line = 0; line <= y; line++) {
    const start = line * (stride + 1);
    const filter = data[start];
    row = Buffer.alloc(stride);
    for (let i = 0; i < stride; i++) {
      const raw = data[start + 1 + i];
      const left = i >= pixelBytes ? row[i - pixelBytes] : 0;
      const up = above[i];
      const upLeft = i >= pixelBytes ? above[i - pixelBytes] : 0;
      let predicted = 0;
      if (filter === 1) predicted = left;
      else if (filter === 2) predicted = up;
      else if (filter === 3) predicted = Math.floor((left + up) / 2);
      else if (filter === 4) {
        const estimate = left + up - upLeft;
        const [toLeft, toUp, toUpLeft] = [left, up, upLeft].map((value) =>
          Math.abs(estimate - value),
        );
        predicted =
          toLeft <= toUp && toLeft <= toUpLeft
            ? left
            : toUp <= toUpLeft
              ? up
              : upLeft;
      }
      row[i] = (raw + predicted) & 0xff;
    }
    above = row;
  }
  return [...row.subarray(x * pixelBytes, x * pixelBytes + 3)];
}
