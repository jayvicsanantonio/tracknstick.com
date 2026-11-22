// Pins what the service worker in vite.config.ts keeps for a fast, offline-ready launch.
// The feedback sounds are precached with the build, Clerk's script is cached as it loads, and updates wait.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const config = readFileSync(
  path.resolve(__dirname, '../../vite.config.ts'),
  'utf8',
);

describe('the service worker configuration', () => {
  it('precaches the feedback sounds with the rest of the build', () => {
    const globPatterns = /globPatterns:\s*\[([^\]]*)\]/.exec(config)?.[1];

    expect(globPatterns).toMatch(/\bmp3\b/);
  });

  it('waits to put a new version in place, rather than reloading the app in use', () => {
    expect(config).toMatch(/registerType:\s*'prompt'/);
  });

  it("caches Clerk's script, refreshing it in the background", () => {
    expect(config).toMatch(
      /clerkScriptUrlPattern\(VITE_CLERK_PUBLISHABLE_KEY\)/,
    );
    expect(config).toMatch(
      /urlPattern:\s*clerkScriptPattern,\s*handler:\s*'StaleWhileRevalidate'/,
    );
  });
});
