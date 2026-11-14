// Runs the habit repository against a real local D1 database.
// Covers what the repository logs when a write fails.
// @vitest-environment node

import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { createMigratedDatabase } from '../../tests/realD1.js';
import { createHabit } from '../habit.repository.js';

describe('createHabit when the insert fails', () => {
  let db: D1Database;
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ db, dispose } = await createMigratedDatabase());
  });

  afterAll(async () => {
    await dispose();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the error and the habit it was creating', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    // D1 rejects an undefined bind value, so the insert throws.
    const habitData = {
      name: undefined,
      frequency: ['Mon'],
      startDate: '2026-01-01T00:00:00.000Z',
    };

    await expect(createHabit(db, 'user_log', habitData)).rejects.toThrow();

    const logged = consoleError.mock.calls.map((call) => String(call[0]));
    const line = logged.find((entry) => entry.includes('Error in createHabit'));

    expect(line).toBeDefined();
    expect(line).toContain('"errorMessage"');
    expect(line).toContain('"habitData"');
    expect(line).toContain('"frequency":["Mon"]');
  });
});
