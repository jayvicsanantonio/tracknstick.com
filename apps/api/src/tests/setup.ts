// Shared test setup: a Hono app with the test bindings, and a stand-in for Clerk.
// The database is the workers project's real D1, migrated by applyMigrations.ts.

import { vi } from 'vitest';
import { Hono } from 'hono';
import { env as workerEnv } from 'cloudflare:workers';

/**
 * A fresh app and the bindings to pass to app.request(). DB is the real D1
 * database every test in the file shares, so a test that counts rows uses a
 * user id of its own.
 */
export function createTestEnv() {
  const env = {
    ENVIRONMENT: 'test',
    CLERK_SECRET_KEY: 'test-clerk-key',
    CLERK_PUBLISHABLE_KEY: 'test-clerk-publishable-key',
    DB: workerEnv.DB,
  };

  const app = new Hono();

  return { app, env };
}

// Mock Clerk state - must be prefixed with 'mock' for Vitest
const mockClerkState = {
  userId: 'test-user-123',
  isAuthenticated: true,
};

// Mock the Clerk SDK verification at the top level
vi.mock('@clerk/backend', () => {
  return {
    createClerkClient: () => ({
      authenticateRequest: (req: Request) => {
        const authHeader = req.headers.get('Authorization');
        const isActuallyAuthenticated =
          mockClerkState.isAuthenticated &&
          !!authHeader &&
          authHeader.startsWith('Bearer ') &&
          !authHeader.toLowerCase().includes('invalid');

        return Promise.resolve({
          isAuthenticated: isActuallyAuthenticated,
          reason: isActuallyAuthenticated ? undefined : 'test-reason',
          toAuth: () => ({
            userId: mockClerkState.userId,
            sessionId: 'test-session',
            sessionClaims: {
              iss: 'https://clerk.test',
              aud: 'test-app',
              exp: Math.floor(Date.now() / 1000) + 3600,
              iat: Math.floor(Date.now() / 1000),
              nbf: Math.floor(Date.now() / 1000),
            },
          }),
        });
      },
    }),
  };
});

/**
 * Mocks authentication to bypass Clerk verification
 */
export function mockAuthentication(
  userId = 'test-user-123',
  authenticated = true
) {
  mockClerkState.userId = userId;
  mockClerkState.isAuthenticated = authenticated;
}

/**
 * Reset all mocks between tests
 */
export function resetMocks() {
  vi.resetAllMocks();
}
