// Checks that the lint config lets the web app take only types from the contracts package.
// A value import would pull zod and every schema into the bundle.

import { describe, it, expect } from 'vitest';
import { ESLint } from 'eslint';
import path from 'path';

const appRoot = path.resolve(__dirname, '../..');

async function restrictedImportErrors(code: string) {
  const eslint = new ESLint({ cwd: appRoot });
  const [result] = await eslint.lintText(code, { filePath: __filename });
  return result.messages.filter(
    (m) => m.ruleId === '@typescript-eslint/no-restricted-imports',
  );
}

describe('imports from @tracknstick/contracts', () => {
  it('allows a type-only import', async () => {
    const errors = await restrictedImportErrors(
      "import type { HabitResponse } from '@tracknstick/contracts';\n" +
        'export type Probe = HabitResponse;\n',
    );

    expect(errors).toEqual([]);
  }, 30_000);

  it('rejects a value import', async () => {
    const errors = await restrictedImportErrors(
      "import { habitSchema } from '@tracknstick/contracts';\n" +
        'export const probe = habitSchema;\n',
    );

    expect(errors).toHaveLength(1);
  }, 30_000);

  it('rejects importing zod', async () => {
    const errors = await restrictedImportErrors(
      "import { z } from 'zod';\nexport const probe = z;\n",
    );

    expect(errors).toHaveLength(1);
  }, 30_000);
});
