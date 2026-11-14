// Shared test setup: a Hono app with the test bindings, a stand-in for Clerk, and console capture.
// The database is the workers project's real D1, migrated by applyMigrations.ts.

import { afterEach, beforeEach, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { env as workerEnv } from 'cloudflare:workers';

type ConsoleLevel = 'debug' | 'info' | 'log' | 'warn' | 'error';

const CONSOLE_LEVELS: ConsoleLevel[] = [
  'debug',
  'info',
  'log',
  'warn',
  'error',
];

// A test must account for every warning and error it causes: takeConsole()
// hands them to the test to assert on, and any left over fail the test.
// Debug, info and log lines are routine and are dropped.
const ASSERTED_LEVELS: ConsoleLevel[] = ['warn', 'error'];

const formatArgument = (argument: unknown): string => {
  if (typeof argument === 'string') return argument;
  if (argument instanceof Error) return `${argument.name}: ${argument.message}`;
  return JSON.stringify(argument);
};

let captured: Record<ConsoleLevel, string[]>;

const resetCaptured = () => {
  captured = { debug: [], info: [], log: [], warn: [], error: [] };
};
resetCaptured();

// Plain functions rather than vi.spyOn, so a test's vi.restoreAllMocks() or
// vi.resetAllMocks() cannot switch the capture off. A test that spies on a
// console method itself still sees every call first.
for (const level of CONSOLE_LEVELS) {
  console[level] = (...args: unknown[]) => {
    captured[level].push(args.map(formatArgument).join(' '));
  };
}

beforeEach(resetCaptured);

afterEach(() => {
  const unasserted = ASSERTED_LEVELS.flatMap((level) =>
    captured[level].map((line) => `console.${level}: ${line}`)
  );
  if (unasserted.length > 0) {
    throw new Error(
      `The test logged output it does not assert on. Read it with takeConsole():\n${unasserted.join('\n')}`
    );
  }
});

/**
 * The lines the current test has written to console[level] so far, which
 * then count as asserted. Each call returns only lines written since the
 * previous call.
 */
export function takeConsole(level: ConsoleLevel): string[] {
  const lines = captured[level];
  captured[level] = [];
  return lines;
}

// What one unauthenticated request logs: the Clerk middleware's two
// warnings, the failure handler's warning and two security events, and the
// error handler's client-error line.
const UNAUTHENTICATED_REQUEST_LOGS: Record<'warn' | 'error', RegExp[]> = {
  warn: [
    /Authentication failed - user not signed in/,
    /\] Authentication failed (?!-)/,
    /Request blocked due to middleware failure: clerk_auth/,
    /Client error occurred/,
  ],
  error: [/Security Event: auth_failure/, /Security Event: middleware_failure/],
};

/**
 * Asserts that the test's warnings and errors so far are exactly what
 * `count` rejected, unauthenticated requests log, and takes them.
 */
export function takeUnauthenticatedRequestLogs(count = 1): void {
  for (const level of ['warn', 'error'] as const) {
    const lines = takeConsole(level);
    for (const pattern of UNAUTHENTICATED_REQUEST_LOGS[level]) {
      expect(
        lines.filter((line) => pattern.test(line)),
        `console.${level} lines matching ${String(pattern)}`
      ).toHaveLength(count);
    }
    expect(lines).toHaveLength(
      UNAUTHENTICATED_REQUEST_LOGS[level].length * count
    );
  }
}

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
