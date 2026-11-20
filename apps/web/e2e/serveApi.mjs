// Starts the API for the end-to-end tests: a fresh local D1 database, then `wrangler dev`.
// The database lives in its own folder, so a run never touches the one `pnpm dev:api` uses.

import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { withRaisedRateLimits } from './testApiConfig.mjs';

const API_DIR = fileURLToPath(new URL('../../api/', import.meta.url));
const STATE_DIR = '.wrangler/e2e-state';
const port = process.argv[2] ?? '8787';

// Every run starts from an empty database brought to the current schema by
// the same migration files production uses.
rmSync(new URL(STATE_DIR, new URL('../../api/', import.meta.url)), {
  recursive: true,
  force: true,
});

const migrate = spawnSync(
  'pnpm',
  [
    'exec',
    'wrangler',
    'd1',
    'migrations',
    'apply',
    'tracknstick-db',
    '--local',
    '--persist-to',
    STATE_DIR,
  ],
  { cwd: API_DIR, stdio: 'inherit' },
);
if (migrate.status !== 0) process.exit(migrate.status ?? 1);

// The suite sends more requests a minute from one IP than the production
// limits allow, so the API runs from a copy of wrangler.toml with them
// raised (see testApiConfig.mjs). The copy sits beside wrangler.toml, so its
// relative paths and .dev.vars resolve the same way; it is gitignored.
const E2E_CONFIG = 'wrangler.e2e.toml';
writeFileSync(
  new URL(E2E_CONFIG, new URL('../../api/', import.meta.url)),
  withRaisedRateLimits(
    readFileSync(new URL('../../api/wrangler.toml', import.meta.url), 'utf8'),
  ),
);

// --local keeps every binding local, so no Cloudflare login is needed; the
// chat route's AI binding is not exercised by these tests. Secrets and the
// development ENVIRONMENT come from apps/api/.dev.vars.
const api = spawn(
  'pnpm',
  [
    'exec',
    'wrangler',
    'dev',
    '--config',
    E2E_CONFIG,
    '--local',
    '--persist-to',
    STATE_DIR,
    '--port',
    port,
  ],
  { cwd: API_DIR, stdio: 'inherit' },
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => api.kill(signal));
}
api.on('exit', (code) => process.exit(code ?? 0));
