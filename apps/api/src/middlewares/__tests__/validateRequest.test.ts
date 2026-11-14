// Pins what validateRequest passes to handlers and what a failed validation returns.
// Only field paths and our own messages are asserted, never zod's default wording.

import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { z } from 'zod';
import { validateRequest } from '../validateRequest.js';
import { errorHandlerEnhanced } from '../errorHandlerEnhanced.js';

const thingSchema = z
  .object({
    name: z.string().min(1),
    when: z.string().datetime(),
    tags: z
      .array(z.string())
      .refine((tags) => new Set(tags).size === tags.length, {
        message: 'Tags must be unique.',
      })
      .optional(),
  })
  .refine((thing) => thing.name !== 'forbidden', {
    message: 'That name is not allowed.',
  });

const listSchema = z.object({
  timeZone: z.string().default('UTC'),
});

// The test environment includes error details in responses, like development.
const ENV = { ENVIRONMENT: 'test' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildApp(): any {
  const app = new Hono();
  app.post('/things', validateRequest(thingSchema, 'json'), (c) =>
    c.json({ received: c.get('validated_json') })
  );
  app.get('/things', validateRequest(listSchema, 'query'), (c) =>
    c.json({ received: c.get('validated_query') })
  );
  app.onError(errorHandlerEnhanced);
  return app;
}

function postThing(body: unknown) {
  return buildApp().request(
    '/things',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    },
    ENV
  );
}

const validThing = { name: 'walk', when: '2026-01-05T08:00:00.000Z' };

describe('validateRequest', () => {
  it('passes the parsed body to the handler', async () => {
    const res = await postThing(validThing);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: validThing });
  });

  it('applies schema defaults to query parameters', async () => {
    const res = await buildApp().request('/things', {}, ENV);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: { timeZone: 'UTC' } });
  });

  it('answers 400 with the validation error code', async () => {
    const res = await postThing({ ...validThing, name: '' });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('validation_error');
    expect(body.error.message).toBe('Validation failed');
  });

  it('lists the messages for each failing field under that field', async () => {
    const res = await postThing({ name: '', when: 'yesterday' });
    const { details } = (await res.json()).error;

    for (const field of ['name', 'when']) {
      expect(details[field]._errors.length).toBeGreaterThan(0);
      for (const message of details[field]._errors) {
        expect(typeof message).toBe('string');
      }
    }
  });

  it('reports a field-level rule with the message we wrote', async () => {
    const res = await postThing({ ...validThing, tags: ['a', 'a'] });
    const { details } = (await res.json()).error;

    expect(details.tags._errors).toEqual(['Tags must be unique.']);
  });

  it('reports a whole-object rule at the top level', async () => {
    const res = await postThing({ ...validThing, name: 'forbidden' });
    const { details } = (await res.json()).error;

    expect(details._errors).toEqual(['That name is not allowed.']);
  });

  it('treats a body that is not JSON as an empty object', async () => {
    const res = await postThing('not json at all');
    const { details } = (await res.json()).error;

    expect(res.status).toBe(400);
    expect(details.name._errors.length).toBeGreaterThan(0);
  });
});
