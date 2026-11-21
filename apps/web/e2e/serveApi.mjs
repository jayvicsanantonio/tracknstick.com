// Starts the API for the end-to-end tests: a fresh local D1 database, then `wrangler dev`.
// The database lives in its own folder, so a run never touches the one `pnpm dev:api` uses.

import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { withMainFrom, withRaisedRateLimits } from './testApiConfig.mjs';

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
// raised (see testApiConfig.mjs).
//
// The copy sits in a folder of its own, two levels below the API, so its
// `main` is rewritten to find the source from there. Wrangler keeps its build
// files in a .wrangler/tmp folder beside the config it runs, and on starting
// deletes any folder there untouched for a day. Beside wrangler.toml, this
// run would share that folder with a `pnpm dev:api` left running, delete the
// build of one idle for a day, and leave it unable to answer.
const E2E_CONFIG_DIR = '.wrangler/e2e-config';
const E2E_CONFIG = `${E2E_CONFIG_DIR}/wrangler.toml`;
mkdirSync(`${API_DIR}${E2E_CONFIG_DIR}`, { recursive: true });
writeFileSync(
  new URL(E2E_CONFIG, new URL('../../api/', import.meta.url)),
  withMainFrom(
    withRaisedRateLimits(
      readFileSync(new URL('../../api/wrangler.toml', import.meta.url), 'utf8'),
    ),
    '../..',
  ),
);

// --local keeps every binding local, so no Cloudflare login is needed; the
// chat route's AI binding is not exercised by these tests. Secrets and the
// development ENVIRONMENT come from apps/api/.dev.vars, named outright since
// Wrangler looks for one only beside the config.
const DEV_VARS = fileURLToPath(new URL('../../api/.dev.vars', import.meta.url));
const api = spawn(
  'pnpm',
  [
    'exec',
    'wrangler',
    'dev',
    '--config',
    E2E_CONFIG,
    '--env-file',
    DEV_VARS,
    '--local',
    // In full: relative, it could be read from the config's folder instead.
    '--persist-to',
    `${API_DIR}${STATE_DIR}`,
    '--port',
    port,
  ],
  { cwd: API_DIR, stdio: 'inherit' },
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => api.kill(signal));
}
api.on('exit', (code) => process.exit(code ?? 0));
