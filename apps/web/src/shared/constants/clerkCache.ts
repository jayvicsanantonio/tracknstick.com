// The service worker's rule for Clerk's script: which URLs it keeps, read from the publishable key.
// vite.config.ts imports this file, so it must stay free of browser-only code.

export const CLERK_SCRIPT_CACHE_NAME = 'clerk-js-cache';

/**
 * The Clerk Frontend API host a publishable key names. A key is
 * `pk_live_` or `pk_test_` followed by the host and a `$`, base64-encoded.
 */
function frontendApiHost(publishableKey: string): string | null {
  const encoded = /^pk_(?:live|test)_(.+)$/.exec(publishableKey)?.[1];
  if (!encoded) return null;
  try {
    const decoded = atob(encoded);
    return decoded.endsWith('$') ? decoded.slice(0, -1) : null;
  } catch {
    return null;
  }
}

/**
 * The URLs of Clerk's script and its chunks, which Clerk loads from its
 * Frontend API host under /npm/@clerk/ on every launch. Cached, a launch no
 * longer waits to download them. Clerk's API calls, at the same host, are
 * left to the network. Null without a readable key: the build then has no
 * rule for Clerk.
 */
export function clerkScriptUrlPattern(
  publishableKey: string | undefined,
): RegExp | null {
  const host = publishableKey ? frontendApiHost(publishableKey) : null;
  if (!host) return null;
  const escaped = host.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^https://${escaped}/npm/@clerk/`, 'i');
}
