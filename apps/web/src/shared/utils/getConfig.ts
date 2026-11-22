const LOCAL_API_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

function isRemoteBrowserHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return Boolean(host && host !== 'localhost' && host !== '127.0.0.1');
}

export function getConfig() {
  const apiHost = import.meta.env.VITE_API_HOST;

  if (!apiHost) {
    throw new Error('Missing required environment variable: VITE_API_HOST');
  }

  // When testing from a phone over a tunnel (e.g. *.trycloudflare.com) or LAN IP
  // against a local API, route `/api` requests same-origin through Vite's proxy
  // so Safari doesn't hit the phone's own localhost or block mixed HTTP/HTTPS.
  if (LOCAL_API_PATTERN.test(apiHost) && isRemoteBrowserHost()) {
    return { apiHost: '' };
  }

  return { apiHost };
}
