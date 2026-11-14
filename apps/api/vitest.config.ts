// Test configuration for the API: most tests run inside workerd, the Workers runtime.
// A few that need Node itself (child processes, the migration files on disk) run in Node.

import path from 'node:path';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

// Tests that need Node APIs workerd does not provide.
const NODE_TESTS = [
  'src/tests/dbScript.test.ts',
  'src/tests/migrations.test.ts',
];

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [
          cloudflareTest(async () => ({
            // The bindings are listed here rather than read from wrangler.toml:
            // its AI binding always calls Cloudflare, so loading it would make
            // every test run need a login. The compatibility settings match
            // wrangler.toml.
            miniflare: {
              compatibilityDate: '2025-03-01',
              compatibilityFlags: ['nodejs_compat'],
              d1Databases: ['DB'],
              ratelimits: {
                CHAT_RATE_LIMITER: {
                  namespace_id: '7301',
                  simple: { limit: 10, period: 60 },
                },
              },
              bindings: {
                ENVIRONMENT: 'test',
                CLERK_SECRET_KEY: 'test-clerk-key',
                CLERK_PUBLISHABLE_KEY: 'test-clerk-publishable-key',
                // Read by src/tests/applyMigrations.ts, which brings each
                // test file's database to the current schema.
                TEST_MIGRATIONS: await readD1Migrations(
                  path.join(import.meta.dirname, 'migrations')
                ),
              },
            },
          })),
        ],
        test: {
          name: 'workers',
          include: ['src/**/*.test.ts'],
          exclude: NODE_TESTS,
          setupFiles: [
            './src/tests/applyMigrations.ts',
            './src/tests/setup.ts',
          ],
          testTimeout: 10000,
        },
      },
      {
        test: {
          name: 'node',
          environment: 'node',
          include: NODE_TESTS,
          testTimeout: 10000,
        },
      },
    ],
  },
});
