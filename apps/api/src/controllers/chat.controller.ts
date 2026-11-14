import { Context } from 'hono';
import type { AppEnv } from '../types/index.js';
import { streamText, type CoreMessage } from 'ai';
import { createWorkersAI } from 'workers-ai-provider';
import { z } from 'zod';
import { chatRequestSchema } from '@tracknstick/contracts';
import * as chatService from '../services/chat.service.js';
import logger from '../utils/logger.js';

/**
 * Handle chat requests with streaming responses.
 * Uses RAG to retrieve relevant Atomic Habits context before generating response.
 */
export const chat = async (c: Context<AppEnv>) => {
  const { userId } = c.get('auth');

  // Phase 1: fallible. Nothing has been committed to the wire yet, so this
  // is the only region where a status code is still negotiable.
  let systemPrompt: string;
  let coreMessages: CoreMessage[];
  let workersai: ReturnType<typeof createWorkersAI>;

  try {
    const body: unknown = await c.req.json();
    const { messages } = chatRequestSchema.parse(body);

    logger.info(
      `Chat request from user ${userId} with ${messages.length} messages`
    );

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user');

    const context = await chatService.retrieveContext(
      c.env.AI,
      c.env.PINECONE_API_KEY,
      lastUserMessage?.content ?? ''
    );

    logger.info(`Retrieved RAG context of ${context.length} characters`);

    workersai = createWorkersAI({ binding: c.env.AI });
    systemPrompt = chatService.getSystemPrompt(context);
    coreMessages = messages as CoreMessage[];
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          error: {
            message: 'Invalid request format',
            code: 'validation_error',
            details: error.issues,
          },
        },
        400
      );
    }

    logger.error(
      `Chat request could not be prepared for user ${userId}`,
      error as Error
    );

    return c.json(
      {
        error: {
          message: 'Failed to process chat request',
          code: 'internal_error',
        },
      },
      500
    );
  }

  // Phase 2: committed. Once the stream response is returned the status is
  // fixed, so a mid-stream failure cannot become a JSON error -- it can only
  // be logged. onError gives that failure a destination other than the AI
  // SDK's default console.error.
  const result = streamText({
    model: workersai('@cf/meta/llama-3.1-8b-instruct'),
    system: systemPrompt,
    messages: coreMessages,
    onError: ({ error }) => {
      logger.error(
        `Chat stream failed mid-response for user ${userId}`,
        error as Error
      );
    },
  });

  return result.toTextStreamResponse();
};
