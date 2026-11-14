// Checks that the @vitest packages this app resolves are the ones its Vitest uses.
// The workers pool loads them from apps/api, where a hoisted older copy would break every test.

import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

// Resolves the way the workers pool does: from this app, not from vitest's
// own folder in the pnpm store.
const fromApp = createRequire(new URL('../../package.json', import.meta.url));

const versionOf = (name: string): string =>
  (fromApp(`${name}/package.json`) as { version: string }).version;

const VITEST_PACKAGES = [
  '@vitest/expect',
  '@vitest/mocker',
  '@vitest/pretty-format',
  '@vitest/runner',
  '@vitest/snapshot',
  '@vitest/spy',
  '@vitest/utils',
];

describe('the @vitest packages apps/api resolves', () => {
  it.each(VITEST_PACKAGES)('%s matches the installed vitest', (name) => {
    expect(versionOf(name)).toBe(versionOf('vitest'));
  });
});
