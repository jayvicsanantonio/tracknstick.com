// Checks the safety rules of scripts/db.js by running it as a child process.
// The child gets an empty PATH, so it can never start wrangler or reach Cloudflare.
// @vitest-environment node

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SCRIPT = fileURLToPath(new URL('../../scripts/db.js', import.meta.url));

function run(...args: string[]) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf8',
    env: { PATH: '' },
  });

  return { status: result.status, output: result.stdout + result.stderr };
}

describe('scripts/db.js', () => {
  it('refuses to reset the remote database', () => {
    const { status, output } = run('reset', '--remote');

    expect(status).toBe(1);
    expect(output).toContain('reset only runs against the local database');
  });

  it('refuses to seed the remote database', () => {
    const { status, output } = run('seed', '--remote');

    expect(status).toBe(1);
    expect(output).toContain('seed only runs against the local database');
  });
});
