// Per-IP rate limit on every request, backed by Cloudflare's Rate Limiting bindings.
// Counters live at Cloudflare, so the limits hold across isolates; wrangler.toml sets them.

import type { Context, MiddlewareHandler, Next } from 'hono';
import type { RateLimit } from '@cloudflare/workers-types';
import { RateLimitError } from '../utils/errors.js';
import type { AppEnv, Bindings } from '../types/index.js';

// The bindings allow a period of 10 or 60 seconds; all of these use 60, so a
// rejected client can always retry within this many seconds.
const PERIOD_SECONDS = 60;

type LimiterName =
  | 'API_RATE_LIMITER'
  | 'HABITS_RATE_LIMITER'
  | 'PROGRESS_RATE_LIMITER';

/**
 * The binding a path counts against. Habits and progress have tighter limits
 * of their own, /health is never limited, and everything else shares one.
 */
function limiterFor(path: string): LimiterName | null {
  if (path.startsWith('/health')) return null;
  if (path.startsWith('/api/v1/habits')) return 'HABITS_RATE_LIMITER';
  if (path.startsWith('/api/v1/progress')) return 'PROGRESS_RATE_LIMITER';
  return 'API_RATE_LIMITER';
}

/**
 * The named binding. A missing one is a configuration error, and it fails
 * the request: skipping the limit instead would switch it off unnoticed.
 */
function bindingFor(env: Bindings, name: LimiterName): RateLimit {
  const limiter = env[name] as RateLimit | undefined;
  if (!limiter) throw new Error(`The ${name} binding is not configured`);
  return limiter;
}

/**
 * Rejects a request once its IP has used up the limit for its route group.
 *
 * Keyed by IP because this runs before authentication, so no user is known
 * yet. The chat route also limits per user, after sign-in (chatRateLimit.ts).
 */
export const rateLimit = (): MiddlewareHandler<AppEnv> => {
  return async (c: Context<AppEnv>, next: Next) => {
    const name = limiterFor(c.req.path);
    if (!name) {
      await next();
      return;
    }

    const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
    const { success } = await bindingFor(c.env, name).limit({ key: ip });

    if (!success) {
      c.header('Retry-After', String(PERIOD_SECONDS));
      throw new RateLimitError('Too many requests');
    }

    await next();
  };
};
