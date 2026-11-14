// Types for the `env` that tests read from cloudflare:workers.
// It carries the Worker's bindings, plus the migrations vitest.config.ts provides.

import type { Bindings } from '../types/index.js';

declare global {
  namespace Cloudflare {
    interface Env extends Bindings {
      TEST_MIGRATIONS: D1Migration[];
    }
  }
}
