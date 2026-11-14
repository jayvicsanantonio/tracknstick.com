// Request validation middleware: parses the JSON body, query or route params with a zod schema.
// Stores the parsed value on the context, and turns a failure into a ValidationError.

import { Context, MiddlewareHandler, Next } from 'hono';
import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';
import type { AppEnv } from '../types/index.js';

type ValidateTarget = 'json' | 'query' | 'param';

/**
 * The value validateRequest stored for a target, typed as the output of the
 * schema the route validated it with. Pass that same schema: it is used only
 * for its type.
 */
export const getValidated = <T extends z.ZodTypeAny>(
  c: Context<AppEnv>,
  target: ValidateTarget,
  _schema: T
): z.output<T> => c.get(`validated_${target}`) as z.output<T>;

export const validateRequest =
  <T extends z.ZodTypeAny>(
    schema: T,
    target: ValidateTarget = 'json'
  ): MiddlewareHandler<AppEnv> =>
  async (c: Context<AppEnv>, next: Next) => {
    try {
      let data: unknown;

      switch (target) {
        case 'json':
          data = await c.req.json().catch(() => ({}));
          break;
        case 'query':
          data = c.req.query();
          break;
        case 'param':
          data = c.req.param();
          break;
        default:
          data = await c.req.json().catch(() => ({}));
          break;
      }

      const result = schema.safeParse(data);

      if (!result.success) {
        const formattedErrors = result.error.format();
        throw new ValidationError('Validation failed', formattedErrors);
      }

      // Add validated data to the context for easy access
      c.set(`validated_${target}`, result.data as z.infer<T>);

      await next();
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      if (error instanceof z.ZodError) {
        throw new ValidationError('Validation failed', error.format());
      }

      if (
        error instanceof Error &&
        error.message.includes('Failed to parse JSON')
      ) {
        throw new ValidationError('Invalid JSON payload');
      }

      throw error;
    }
  };
