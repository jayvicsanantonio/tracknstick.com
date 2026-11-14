// Test setup: brings each test file's D1 database to the current schema.
// Uses Cloudflare's own migration runner on the files in migrations/, as the deploy does.

import { applyD1Migrations } from 'cloudflare:test';
import { env } from 'cloudflare:workers';

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
