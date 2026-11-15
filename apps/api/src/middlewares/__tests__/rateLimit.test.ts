// Covers the per-IP rate limit on the real Rate Limiting bindings vitest.config.ts provides.
// Habits and progress have tighter limits of their own; /health is never limited.

import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { env as workerEnv } from 'cloudflare:workers';
import type { AppEnv } from '../../types/index.js';
import { rateLimit } from '../rateLimit.js';
import { errorHandler } from '../errorHandler.js';
import { takeConsole } from '../../tests/setup.js';

const env = {
  ENVIRONMENT: 'test',
  API_RATE_LIMITER: workerEnv.API_RATE_LIMITER,
  HABITS_RATE_LIMITER: workerEnv.HABITS_RATE_LIMITER,
  PROGRESS_RATE_LIMITER: workerEnv.PROGRESS_RATE_LIMITER,
};

const app = new Hono<AppEnv>();
app.use('*', rateLimit());
app.all('*', (c) => c.text('ok'));
app.onError(errorHandler);

/** Sends `count` requests from one IP and returns the statuses, in order. */
async function send(path: string, ip: string, count: number) {
  const statuses: number[] = [];
  for (let i = 0; i < count; i++) {
    const res = await app.request(
      path,
      { headers: { 'CF-Connecting-IP': ip } },
      env
    );
    statuses.push(res.status);
  }
  return statuses;
}

/** Asserts that `count` requests were rejected, and takes their log lines. */
function expectRejectedLogs(count: number) {
  const warnings = takeConsole('warn');
  expect(warnings).toHaveLength(count);
  for (const line of warnings) expect(line).toContain('Client error occurred');
}

describe('rateLimit', () => {
  it('allows 100 API requests a minute from one IP, then answers 429', async () => {
    const statuses = await send('/api/v1/achievements', '10.0.0.1', 101);

    expect(statuses.slice(0, 100).every((s) => s === 200)).toBe(true);
    expect(statuses[100]).toBe(429);
    expectRejectedLogs(1);
  });

  it('tells a rejected client when to retry', async () => {
    await send('/api/v1/chat', '10.0.0.2', 100);

    const res = await app.request(
      '/api/v1/chat',
      { headers: { 'CF-Connecting-IP': '10.0.0.2' } },
      env
    );

    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('60');
    expectRejectedLogs(1);
  });

  it('gives /api/v1/habits its own limit of 50 a minute', async () => {
    const statuses = await send('/api/v1/habits/7/trackers', '10.0.0.3', 51);

    expect(statuses.slice(0, 50).every((s) => s === 200)).toBe(true);
    expect(statuses[50]).toBe(429);
    expectRejectedLogs(1);
  });

  it('gives /api/v1/progress its own limit of 30 a minute', async () => {
    const statuses = await send('/api/v1/progress/history', '10.0.0.4', 31);

    expect(statuses.slice(0, 30).every((s) => s === 200)).toBe(true);
    expect(statuses[30]).toBe(429);
    expectRejectedLogs(1);
  });

  it('counts each route group separately', async () => {
    await send('/api/v1/progress/streaks', '10.0.0.5', 31);
    expectRejectedLogs(1);

    expect(await send('/api/v1/habits', '10.0.0.5', 1)).toEqual([200]);
    expect(await send('/api/v1/achievements', '10.0.0.5', 1)).toEqual([200]);
  });

  it('counts each IP separately', async () => {
    await send('/api/v1/progress/overview', '10.0.0.6', 31);
    expectRejectedLogs(1);

    expect(await send('/api/v1/progress/overview', '10.0.0.7', 1)).toEqual([
      200,
    ]);
  });

  it('never limits /health', async () => {
    const statuses = await send('/health/db', '10.0.0.8', 150);

    expect(statuses.every((s) => s === 200)).toBe(true);
  });

  it('fails the request when its limiter binding is missing, rather than skipping the limit', async () => {
    const res = await app.request(
      '/api/v1/achievements',
      { headers: { 'CF-Connecting-IP': '10.0.0.9' } },
      { ENVIRONMENT: 'test' }
    );

    expect(res.status).toBe(500);
    // The error handler logs an unexpected error twice: as a server error and
    // as an uncategorised one. Both name the missing binding.
    const errors = takeConsole('error');
    expect(errors).toEqual([
      expect.stringContaining('Server error occurred'),
      expect.stringContaining('Unknown error occurred'),
    ]);
    for (const line of errors) {
      expect(line).toContain('The API_RATE_LIMITER binding is not configured');
    }
  });
});
