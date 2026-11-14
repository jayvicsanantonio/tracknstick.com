// Per-user rate limit for the chat endpoint, backed by Cloudflare's Rate Limiting binding
// Runs after authentication so the limit follows the signed-in user rather than an IP address

import { Context, MiddlewareHandler, Next } from 'hono';
import { RateLimitError } from '../utils/errors.js';
import type { AppEnv } from '../types/index.js';

/**
 * Rejects the request once the signed-in user has used up their chat allowance.
 *
 * The allowance itself (requests per period) is configured on the
 * CHAT_RATE_LIMITER binding in wrangler.toml. Counters are kept by Cloudflare
 * rather than in this isolate's memory, so they survive isolate eviction.
 */
export const chatRateLimit = (): MiddlewareHandler<AppEnv> => {
  return async (c: Context<AppEnv>, next: Next) => {
    const { userId } = c.get('auth');
    const limiter: RateLimit = c.env.CHAT_RATE_LIMITER;

    const { success } = await limiter.limit({ key: userId });

    if (!success) {
      throw new RateLimitError('Too many requests');
    }

    await next();
  };
};
