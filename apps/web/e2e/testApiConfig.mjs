// Builds the Wrangler config the e2e run starts the API with: wrangler.toml with its per-IP limits raised.
// The suite sends more requests a minute from one IP than any real user; the API's own tests cover the limits.

/** The per-minute limit the e2e API allows for each raised limiter. */
export const E2E_RATE_LIMIT = 1000;

// The limiters every page load counts against. The chat limiter is left as
// it is: the e2e tests never send a chat message.
const RAISED_LIMITERS = [
  'API_RATE_LIMITER',
  'HABITS_RATE_LIMITER',
  'PROGRESS_RATE_LIMITER',
];

/**
 * The given wrangler.toml text with the `limit` of each raised limiter's
 * [[ratelimits]] block set to E2E_RATE_LIMIT, and nothing else changed.
 * Throws if a limiter is missing or has no limit, so a renamed limiter
 * cannot leave the e2e run quietly back on the production limit.
 */
export function withRaisedRateLimits(toml) {
  const raised = new Set();
  const blocks = toml.split(/(?=^\[\[ratelimits\]\]$)/m).map((block) => {
    const name = block.match(/^name = "(\w+)"$/m)?.[1];
    if (!block.startsWith('[[ratelimits]]') || !RAISED_LIMITERS.includes(name)) {
      return block;
    }
    const updated = block.replace(
      /^(\s*limit = )\d+$/m,
      `$1${E2E_RATE_LIMIT}`,
    );
    if (updated !== block) raised.add(name);
    return updated;
  });

  const missing = RAISED_LIMITERS.filter((name) => !raised.has(name));
  if (missing.length > 0) {
    throw new Error(
      `wrangler.toml has no limit to raise for ${missing.join(', ')}`,
    );
  }
  return blocks.join('');
}
