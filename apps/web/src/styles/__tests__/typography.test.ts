// Pins the typefaces in src/styles/index.css: San Francisco for text and controls, as iOS sets them, and the brand's for titles.
// On an iPhone the text follows the size chosen in Settings (Dynamic Type), as a native app's does.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const css = readFileSync(path.resolve(__dirname, '../index.css'), 'utf8');

/** A typeface variable's family list, as declared in the @theme block. */
function family(variable: string): string {
  const match = new RegExp(`--${variable}:([^;]*);`).exec(css);
  if (!match) throw new Error(`--${variable} is not declared`);
  return match[1].replace(/\s+/g, ' ').trim();
}

describe('typefaces', () => {
  it("sets text and controls in the system's own typeface, San Francisco on Apple devices", () => {
    expect(family('font-sans')).toMatch(/^system-ui, -apple-system,/);
    expect(family('font-sans')).not.toMatch(/Jakarta/);
  });

  it("keeps the brand's typeface for titles and the logo", () => {
    expect(family('font-display')).toMatch(/^'Plus Jakarta Sans Variable'/);
  });

  it("follows the iPhone's text size setting, scaling the layout with it", () => {
    const rule =
      /@supports \(font: -apple-system-body\)\s*\{\s*@media \(pointer: coarse\)\s*\{\s*html\s*\{([^}]*)\}/.exec(
        css,
      )?.[1];

    expect(rule).toMatch(/font:\s*-apple-system-body/);
    // The shorthand resets the family and spacing; both are set back.
    expect(rule).toMatch(/font-family:\s*var\(--font-sans\)/);
    expect(rule).toMatch(/line-height:\s*1\.5/);
  });
});
