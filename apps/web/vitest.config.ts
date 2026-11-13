import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/testing/setup.ts',
    // Any module importing the API client pulls in getConfig(), which throws
    // at module scope without these. Supplying them here keeps the suite
    // self-contained rather than dependent on a developer's .env.local --
    // which is why a test importing the api module passed locally and failed
    // in CI.
    env: {
      VITE_API_HOST: 'http://api.test',
      VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_stub',
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockServiceWorker.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@testing': path.resolve(__dirname, './src/testing'),
    },
  },
});
