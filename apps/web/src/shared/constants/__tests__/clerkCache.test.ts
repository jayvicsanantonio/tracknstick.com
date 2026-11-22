// Covers clerkScriptUrlPattern: which requests the service worker keeps as Clerk's script.
// The host comes from the publishable key, so the rule follows whichever Clerk instance the build uses.

import { describe, it, expect } from 'vitest';
import { clerkScriptUrlPattern } from '../clerkCache';

/** A publishable key, as Clerk issues them: its Frontend API host, encoded. */
function keyFor(host: string, kind = 'live') {
  return `pk_${kind}_${btoa(`${host}$`)}`;
}

const SCRIPT =
  'https://clerk.tracknstick.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js';

describe('clerkScriptUrlPattern', () => {
  it("matches Clerk's script at the host the key names", () => {
    const pattern = clerkScriptUrlPattern(keyFor('clerk.tracknstick.com'));

    expect(pattern?.test(SCRIPT)).toBe(true);
    expect(
      pattern?.test(
        'https://clerk.tracknstick.com/npm/@clerk/clerk-js@5.61.0/dist/ui-common_ab12.js',
      ),
    ).toBe(true);
  });

  it("follows a development instance's host", () => {
    const pattern = clerkScriptUrlPattern(
      keyFor('happy-otter-12.clerk.accounts.dev', 'test'),
    );

    expect(
      pattern?.test(
        'https://happy-otter-12.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js',
      ),
    ).toBe(true);
    expect(pattern?.test(SCRIPT)).toBe(false);
  });

  it("leaves Clerk's API alone, whose answers must always be fresh", () => {
    const pattern = clerkScriptUrlPattern(keyFor('clerk.tracknstick.com'));

    expect(pattern?.test('https://clerk.tracknstick.com/v1/client')).toBe(
      false,
    );
  });

  it('matches nothing at another host that merely starts the same', () => {
    const pattern = clerkScriptUrlPattern(keyFor('clerk.tracknstick.com'));

    expect(
      pattern?.test(
        'https://clerk.tracknstick.com.evil.test/npm/@clerk/clerk-js@5/dist/clerk.browser.js',
      ),
    ).toBe(false);
  });

  it('has no rule without a readable key', () => {
    expect(clerkScriptUrlPattern(undefined)).toBeNull();
    expect(clerkScriptUrlPattern('not-a-key')).toBeNull();
  });
});
