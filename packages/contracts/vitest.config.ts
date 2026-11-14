// Test configuration for the contracts package.
// The schemas are plain TypeScript with no runtime needs, so tests run in Node.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
