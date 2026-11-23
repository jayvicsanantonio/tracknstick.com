// Pins the headers Cloudflare Pages sends from public/_headers: security on every page, and caching.
// Also checks the HTML pages hold nothing the Content-Security-Policy would block.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const WEB_ROOT = path.resolve(__dirname, '../..');

function read(file: string): string {
  return readFileSync(path.join(WEB_ROOT, file), 'utf8');
}

/**
 * The headers of each URL pattern in a Pages `_headers` file: a pattern on
 * a line of its own, then its headers indented beneath it.
 */
function parseHeadersFile(text: string): Map<string, Map<string, string>> {
  const rules = new Map<string, Map<string, string>>();
  let current: Map<string, string> | undefined;
  for (const line of text.split('\n')) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = new Map();
      rules.set(line.trim(), current);
      continue;
    }
    const colon = line.indexOf(':');
    current?.set(
      line.slice(0, colon).trim().toLowerCase(),
      line.slice(colon + 1).trim(),
    );
  }
  return rules;
}

const headerRules = parseHeadersFile(read('public/_headers'));
const pageHeaders = headerRules.get('/*');

/** The sources a CSP directive allows, or undefined when it is absent. */
function directive(name: string): string[] | undefined {
  const csp = pageHeaders?.get('content-security-policy') ?? '';
  const found = csp
    .split(';')
    .map((part) => part.trim().split(/\s+/))
    .find(([directiveName]) => directiveName === name);
  return found?.slice(1);
}

describe('the security headers in public/_headers', () => {
  it('apply to every path', () => {
    expect(pageHeaders).toBeDefined();
  });

  it.each([
    ['strict-transport-security', 'max-age=31536000'],
    ['x-content-type-options', 'nosniff'],
    ['x-frame-options', 'DENY'],
    ['referrer-policy', 'strict-origin-when-cross-origin'],
    ['permissions-policy', 'camera=(), microphone=(), geolocation=()'],
  ])('set %s to %s', (name, value) => {
    expect(pageHeaders?.get(name)).toBe(value);
  });

  it('fall back to the site itself for anything the policy does not name', () => {
    expect(directive('default-src')).toEqual(["'self'"]);
  });

  it('allow no inline or evaluated script', () => {
    expect(directive('script-src')).not.toContain("'unsafe-inline'");
    expect(directive('script-src')).not.toContain("'unsafe-eval'");
  });

  it('let Clerk load its script and reach its Frontend API', () => {
    expect(directive('script-src')).toContain('https://clerk.tracknstick.com');
    expect(directive('connect-src')).toContain('https://clerk.tracknstick.com');
    expect(directive('img-src')).toContain('https://img.clerk.com');
    expect(directive('worker-src')).toEqual(["'self'", 'blob:']);
  });

  it('let Clerk show its bot protection challenge', () => {
    expect(directive('script-src')).toContain(
      'https://challenges.cloudflare.com',
    );
    expect(directive('frame-src')).toContain(
      'https://challenges.cloudflare.com',
    );
  });

  // The host VITE_API_HOST names in the Cloudflare Pages build settings,
  // which live in the dashboard rather than in this repository.
  it('let the app call the API at the host the production build uses', () => {
    expect(directive('connect-src')).toContain(
      'https://tracknstick-api.hi-00e.workers.dev',
    );
  });

  it('keep the app out of frames, plugins and other base URLs', () => {
    expect(directive('frame-ancestors')).toEqual(["'none'"]);
    expect(directive('object-src')).toEqual(["'none'"]);
    expect(directive('base-uri')).toEqual(["'self'"]);
    expect(directive('form-action')).toEqual(["'self'"]);
  });
});

describe('the caching headers in public/_headers', () => {
  // Vite names each built file after a hash of its contents, so a file at
  // one URL never changes.
  it('let browsers keep the hashed build files for a year without asking', () => {
    expect(headerRules.get('/assets/*')?.get('cache-control')).toBe(
      'public, max-age=31536000, immutable',
    );
  });

  // Fetched fresh, so a deploy reaches users on their next visit.
  it.each(['/sw.js', '/manifest.json'])(
    'have browsers check %s with the server every time',
    (file) => {
      expect(headerRules.get(file)?.get('cache-control')).toBe('no-cache');
    },
  );
});

describe.each(['index.html'])('%s, under that policy', (file) => {
  const html = read(file);

  it('has no inline script, which the policy blocks', () => {
    const scripts = html.match(/<script\b[^>]*>/g) ?? [];
    for (const tag of scripts) expect(tag).toMatch(/\bsrc=/);
  });

  it('has no inline event handler, which the policy blocks', () => {
    expect(html).not.toMatch(/<[^>]+\son[a-z]+=/i);
  });
});
