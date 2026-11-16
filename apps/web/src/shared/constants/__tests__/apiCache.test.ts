// Covers apiCacheUrlPattern: which requests the service worker's API cache keeps.
// It must match the API the build calls, at VITE_API_HOST, and nothing else.

import { describe, it, expect } from 'vitest';
import { apiCacheUrlPattern } from '../apiCache';

const PRODUCTION = 'https://tracknstick-api.hi-00e.workers.dev';

describe('apiCacheUrlPattern', () => {
  it('matches the API routes at the host the build calls', () => {
    const pattern = apiCacheUrlPattern(PRODUCTION);

    expect(pattern.test(`${PRODUCTION}/api/v1/habits`)).toBe(true);
    expect(pattern.test(`${PRODUCTION}/api/v1/progress/overview?x=1`)).toBe(
      true,
    );
  });

  it('ignores a trailing slash on the host', () => {
    const pattern = apiCacheUrlPattern(`${PRODUCTION}/`);

    expect(pattern.test(`${PRODUCTION}/api/v1/habits`)).toBe(true);
  });

  it('does not match the API host outside /api/', () => {
    expect(apiCacheUrlPattern(PRODUCTION).test(`${PRODUCTION}/health`)).toBe(
      false,
    );
  });

  it('does not match another host', () => {
    const pattern = apiCacheUrlPattern(PRODUCTION);

    expect(pattern.test('https://api.tracknstick.com/api/v1/habits')).toBe(
      false,
    );
    // A dot in the host is a literal dot, not "any character".
    expect(
      pattern.test('https://tracknstick-api.hi-00eXworkers.dev/api/v1/habits'),
    ).toBe(false);
    // The host must end where the path starts.
    expect(pattern.test(`${PRODUCTION}.evil.example/api/v1/habits`)).toBe(
      false,
    );
  });

  it('matches a local API host with a port', () => {
    const pattern = apiCacheUrlPattern('http://localhost:3000');

    expect(pattern.test('http://localhost:3000/api/v1/habits')).toBe(true);
    expect(pattern.test('http://localhost:30000/api/v1/habits')).toBe(false);
  });
});
