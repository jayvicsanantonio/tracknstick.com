// Request shape for the chat endpoint (POST /api/v1/chat).
// The response is a plain text stream, so it has no schema.

import { z } from 'zod';

// Bounds on what one chat request can cost. Every message sent here is
// forwarded to a metered model, so neither the size of a message nor the
// amount of history riding along with it is left to the client.
export const MAX_MESSAGE_CHARS = 4000;
export const MAX_CONTEXT_MESSAGES = 20;

/**
 * Keeps the most recent messages, opening on a user turn where there is one,
 * so a long conversation costs no more than a short one.
 */
const toContextWindow = <T extends { role: string }>(messages: T[]): T[] => {
  const recent = messages.slice(-MAX_CONTEXT_MESSAGES);
  const firstUserTurn = recent.findIndex((m) => m.role === 'user');
  return firstUserTurn > 0 ? recent.slice(firstUserTurn) : recent;
};

// AI SDK 5 sends message parts. Non-text parts (step-start, reasoning,
// tool-*) are dropped rather than rejected, so a well-formed assistant turn
// does not 400 the whole request.
const partSchema = z
  .object({ type: z.string(), text: z.string().optional() })
  .passthrough();

/**
 * Produces the exact shape the rest of the pipeline consumes, so there is one
 * message type rather than three successive near-copies of it.
 *
 * 'system' is not accepted: the system prompt is owned by the server, and
 * laundering a client-supplied system turn into 'user' let any authenticated
 * caller inject one.
 */
export const chatRequestSchema = z.object({
  messages: z
    .array(
      z
        .object({
          id: z.string().optional(),
          role: z.enum(['user', 'assistant']),
          parts: z.array(partSchema).optional(),
          // Legacy shape, still sent by the current web client
          content: z.string().optional(),
        })
        .transform((m) => ({
          role: m.role,
          content: m.parts?.length
            ? m.parts
                .filter((p) => p.type === 'text' && typeof p.text === 'string')
                .map((p) => p.text as string)
                .join('')
            : (m.content ?? ''),
        }))
        .refine((m) => m.content.trim().length > 0, {
          message: 'Message must contain non-empty text',
        })
        .refine((m) => m.content.length <= MAX_MESSAGE_CHARS, {
          message: `Message must be at most ${MAX_MESSAGE_CHARS} characters`,
        })
    )
    .min(1, 'At least one message is required')
    .transform(toContextWindow),
});

/** What a client sends. */
export type ChatRequest = z.input<typeof chatRequestSchema>;
export type ChatRequestMessage = ChatRequest['messages'][number];

/** What the API works with after validation: plain role and text per message. */
export type ChatMessages = z.output<typeof chatRequestSchema>['messages'];
