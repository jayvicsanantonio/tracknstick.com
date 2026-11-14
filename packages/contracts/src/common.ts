// Response shapes shared by more than one group of endpoints.
// The error envelope here is what every failed request returns.

import { z } from 'zod';

/** A bare confirmation, returned by writes that have nothing else to report. */
export const messageResponseSchema = z.object({
  message: z.string(),
});

/**
 * The body of every error response. `details` is only present for validation
 * failures, and outside production; `requestId` and `timestamp` are present
 * on errors that pass through the API's error handler.
 */
export const errorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string(),
    details: z.unknown().optional(),
    requestId: z.string().optional(),
    timestamp: z.string().optional(),
  }),
});

export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
