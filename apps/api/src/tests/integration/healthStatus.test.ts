// Health endpoints must not report ok while a component is failing

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { healthRoutes } from '../../routes/health.js';

function envWith(dbBehaviour: 'ok' | 'throws' | 'empty'): any {
  return {
    ENVIRONMENT: 'test',
    DB: {
      prepare: () => ({
        bind: () => ({
          first: () => {
            if (dbBehaviour === 'throws') {
              return Promise.reject(new Error('connection refused'));
            }
            if (dbBehaviour === 'empty') return Promise.resolve(null);
            return Promise.resolve({ db_check: 1 });
          },
        }),
      }),
    },
  };
}

describe('health endpoints', () => {
  let app: any;

  beforeEach(() => {
    app = new Hono();
    app.route('/health', healthRoutes);
  });

  it('reports ok when the database answers', async () => {
    const res = await app.request('/health/details', {}, envWith('ok'));
    const body = (await res.json()) as { status: string };

    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
  });

  it('does NOT report ok when the database throws', async () => {
    const res = await app.request('/health/details', {}, envWith('throws'));
    const body = (await res.json()) as {
      status: string;
      components: { database: { status: string } };
    };

    expect(body.status).toBe('error');
    expect(body.components.database.status).toBe('error');
    expect(res.status).toBe(503);
  });

  it('/db and /details agree that the database is unhealthy', async () => {
    const db = await app.request('/health/db', {}, envWith('throws'));
    const details = await app.request('/health/details', {}, envWith('throws'));

    const dbBody = (await db.json()) as { status: string };
    const detailsBody = (await details.json()) as { status: string };

    expect(dbBody.status).toBe('error');
    expect(detailsBody.status).toBe('error');
    expect(db.ok).toBe(false);
    expect(details.ok).toBe(false);
  });

  it('liveness stays ok without touching the database', async () => {
    const res = await app.request('/health', {}, envWith('throws'));
    expect(res.status).toBe(200);
  });
});
