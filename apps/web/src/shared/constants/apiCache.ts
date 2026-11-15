// Names shared by the service worker's API response cache and the code that clears it
// vite.config.ts imports API_CACHE_NAME, so this file must stay free of browser-only code

export const API_CACHE_NAME = 'api-cache';
export const API_CACHE_OWNER_KEY = 'track-n-stick-api-cache-owner';

/**
 * The requests the API cache keeps: everything under /api/ at the host the
 * build calls. A RegExp rather than a function, because the service worker
 * is generated from this config as source text.
 */
export function apiCacheUrlPattern(apiHost: string): RegExp {
  const origin = apiHost.replace(/\/+$/, '');
  const escaped = origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}/api/`, 'i');
}
