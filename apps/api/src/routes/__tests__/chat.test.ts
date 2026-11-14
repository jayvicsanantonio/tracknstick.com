// Exercises the chat route's per-user rate limit with a real local limiter.
// The limiter is the Rate Limiting binding vitest.config.ts gives the workers project.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { env as workerEnv } from 'cloudflare:workers';
import { Hono } from 'hono';
import type { AppEnv } from '../../types/index.js';
import { mockAuthentication } from '../../tests/setup.js';
import { chatRoutes } from '../chat.js';
import * as chatService from '../../services/chat.service.js';
import { errorHandlerEnhanced } from '../../middlewares/errorHandlerEnhanced.js';

vi.mock('ai', () => ({
  streamText: vi.fn(() => ({
    toTextStreamResponse: () => new Response('streamed'),
  })),
}));
vi.mock('workers-ai-provider', () => ({
  createWorkersAI: () => () => 'model',
}));

// The limit vitest.config.ts gives the binding, the same as wrangler.toml's.
const REQUESTS_PER_MINUTE = 10;

describe('chat route rate limit', () => {
  const env = {
    ENVIRONMENT: 'test',
    CLERK_SECRET_KEY: 'test-clerk-key',
    CLERK_PUBLISHABLE_KEY: 'test-clerk-publishable-key',
    AI: {},
    PINECONE_API_KEY: 'k',
    CHAT_RATE_LIMITER: workerEnv.CHAT_RATE_LIMITER,
  };

  beforeEach(() => {
    vi.spyOn(chatService, 'retrieveContext').mockResolvedValue('');
    vi.spyOn(chatService, 'getSystemPrompt').mockReturnValue('system');
  });

  function ask(userId: string) {
    mockAuthentication(userId);

    const app = new Hono<AppEnv>();
    app.route('/api/v1/chat', chatRoutes);
    app.onError(errorHandlerEnhanced);

    return app.request(
      '/api/v1/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'how do I start?' }],
        }),
      },
      env
    );
  }

  it('answers 429 once a user exceeds their limit, without affecting other users', async () => {
    for (let i = 0; i < REQUESTS_PER_MINUTE; i++) {
      const allowed = await ask('user_busy');
      expect(allowed.status).toBe(200);
    }

    const blocked = await ask('user_busy');
    expect(blocked.status).toBe(429);

    const otherUser = await ask('user_quiet');
    expect(otherUser.status).toBe(200);
  });
});
