// Starts the API for the end-to-end tests: a fresh local D1 database, then `wrangler dev`.
// The database lives in its own folder, so a run never touches the one `pnpm dev:api` uses.

import { spawn, spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

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

// --local keeps every binding local, so no Cloudflare login is needed; the
// chat route's AI binding is not exercised by these tests. Secrets and the
// development ENVIRONMENT come from apps/api/.dev.vars.
const api = spawn(
  'pnpm',
  [
    'exec',
    'wrangler',
    'dev',
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
