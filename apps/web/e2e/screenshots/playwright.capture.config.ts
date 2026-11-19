// Playwright configuration for capturing every screen as PNGs for the design docs.
// Starts a checkout's local API and web app, like the e2e run; see docs/design/ui-ux-polish.

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// The checkout to capture: this one by default, or another one's apps/web
// (for example a worktree of main, for the "before" shots).
const WEB_DIR = path.resolve(process.env.WEB_DIR ?? path.join(HERE, '../..'));

// The same keys and test user as the e2e run; see e2e/README.md.
for (const file of ['.env.e2e.local', '../api/.dev.vars']) {
  const envFile = path.join(WEB_DIR, file);
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

const WEB_PORT = 5174;
const API_PORT = 8787;

export default defineConfig({
  testDir: HERE,
  testMatch: /screens\.capture\.ts/,
  workers: 1,
  // Seeding, four theme and size combinations, and the pauses that keep the
  // local API under its rate limit take several minutes.
  timeout: 30 * 60_000,
  reporter: 'list',
  use: { baseURL: `http://localhost:${WEB_PORT}`, trace: 'off' },
  webServer: [
    {
      command: `node e2e/serveApi.mjs ${API_PORT}`,
      cwd: WEB_DIR,
      url: `http://localhost:${API_PORT}/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `pnpm exec vite --port ${WEB_PORT} --strictPort`,
      cwd: WEB_DIR,
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        VITE_API_HOST: `http://localhost:${API_PORT}`,
        VITE_CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY ?? '',
      },
    },
  ],
});
