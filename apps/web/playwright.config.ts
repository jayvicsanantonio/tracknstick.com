// Playwright configuration for the end-to-end tests: this web app and the API, both run locally.
// Signs in once as the Clerk test user (e2e/auth.setup.ts) and reuses that session in every test.

import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';
import { AUTH_FILE } from './e2e/authFile';

// The Clerk development keys and the test user's email. CI sets them from
// the e2e environment's secrets. On a developer machine the keys come from
// the API's .dev.vars, which already holds them, and the email from
// .env.e2e.local. Both files are gitignored; see e2e/README.md.
// loadEnvFile() never overrides a variable that is already set.
for (const file of ['.env.e2e.local', '../api/.dev.vars']) {
  if (existsSync(file)) process.loadEnvFile(file);
}

// Ports of their own, so a run never reuses `pnpm dev:web` or `pnpm dev:api`.
// 5174 is one of the origins the API accepts in development.
const WEB_PORT = 5174;
const API_PORT = 8787;
// The production build, which alone has a service worker, served by
// `vite preview` on a port of its own, so a run never reuses `pnpm preview`.
// The API is told to accept it.
const PREVIEW_PORT = 4174;
const PREVIEW_OUT_DIR = 'e2e/.dist';

// The web app's build settings, shared by the dev server and the build.
const webEnv = {
  VITE_API_HOST: `http://localhost:${API_PORT}`,
  VITE_CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY ?? '',
};

export default defineConfig({
  testDir: './e2e',
  // `.e2e.ts`, so Vitest's default `*.test.ts` / `*.spec.ts` match never
  // picks these up.
  testMatch: /.*\.e2e\.ts/,
  // One test user and one database: the tests run one at a time.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    // A trace records cookies and network traffic, which include the test
    // user's session. The repository is public, so CI keeps none; a local
    // failure keeps one in test-results/ (gitignored).
    trace: process.env.CI ? 'off' : 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'signed in',
      dependencies: ['setup'],
      testIgnore: [
        /signedOut\.e2e\.ts/,
        /offline\.e2e\.ts/,
        /serviceWorker\.e2e\.ts/,
      ],
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
    },
    {
      name: 'production build',
      dependencies: ['setup'],
      testMatch: [/offline\.e2e\.ts/, /serviceWorker\.e2e\.ts/],
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
        baseURL: `http://localhost:${PREVIEW_PORT}`,
      },
    },
    {
      name: 'signed out',
      testMatch: /signedOut\.e2e\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `node e2e/serveApi.mjs ${API_PORT} http://localhost:${PREVIEW_PORT}`,
      url: `http://localhost:${API_PORT}/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `pnpm exec vite --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: webEnv,
    },
    {
      command: `pnpm exec vite build --outDir ${PREVIEW_OUT_DIR} && pnpm exec vite preview --outDir ${PREVIEW_OUT_DIR} --port ${PREVIEW_PORT} --strictPort`,
      url: `http://localhost:${PREVIEW_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: webEnv,
    },
  ],
});
