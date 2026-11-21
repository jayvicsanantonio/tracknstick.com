// Covers the Wrangler config the e2e run starts the API with: the real wrangler.toml, limits raised.
// Only the per-IP API, habits and progress limiters change; a missing limiter fails loudly.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  E2E_RATE_LIMIT,
  withMainFrom,
  withRaisedRateLimits,
} from '../testApiConfig.mjs';

const wranglerToml = readFileSync(
  path.resolve(__dirname, '../../../api/wrangler.toml'),
  'utf8',
);

/** The `limit` of the [[ratelimits]] block with this name. */
function limitOf(toml, name) {
  const block = toml
    .split(/(?=^\[\[ratelimits\]\]$)/m)
    .find((part) => part.includes(`name = "${name}"`));
  return Number(block?.match(/^\s*limit = (\d+)$/m)?.[1]);
}

describe('withRaisedRateLimits', () => {
  it('raises the API, habits and progress limits', () => {
    const config = withRaisedRateLimits(wranglerToml);

    for (const name of [
      'API_RATE_LIMITER',
      'HABITS_RATE_LIMITER',
      'PROGRESS_RATE_LIMITER',
    ]) {
      expect(limitOf(wranglerToml, name)).toBeLessThan(E2E_RATE_LIMIT);
      expect(limitOf(config, name)).toBe(E2E_RATE_LIMIT);
    }
  });

  it('leaves the chat limit and everything else as it is', () => {
    const config = withRaisedRateLimits(wranglerToml);

    expect(limitOf(config, 'CHAT_RATE_LIMITER')).toBe(
      limitOf(wranglerToml, 'CHAT_RATE_LIMITER'),
    );
    const withoutLimits = (toml) => toml.replace(/^\s*limit = \d+$/gm, '');
    expect(withoutLimits(config)).toBe(withoutLimits(wranglerToml));
  });

  it('fails when a limiter it should raise is missing', () => {
    const withoutHabits = wranglerToml.replace(
      'name = "HABITS_RATE_LIMITER"',
      'name = "SOMETHING_ELSE"',
    );

    expect(() => withRaisedRateLimits(withoutHabits)).toThrow(
      /HABITS_RATE_LIMITER/,
    );
  });
});

describe('withMainFrom', () => {
  it("points the entry point at the API's source from another folder", () => {
    const config = withMainFrom(wranglerToml, '../..');

    expect(config).toMatch(/^main = "\.\.\/\.\.\/src\/index\.ts"$/m);
  });

  it('changes nothing else', () => {
    const config = withMainFrom(wranglerToml, '../..');
    const withoutMain = (toml) => toml.replace(/^main = .*$/m, '');

    expect(withoutMain(config)).toBe(withoutMain(wranglerToml));
  });

  it('fails when the config has no entry point to move', () => {
    const withoutMain = wranglerToml.replace(/^main = .*$/m, '');

    expect(() => withMainFrom(withoutMain, '../..')).toThrow(/main/);
  });
});
