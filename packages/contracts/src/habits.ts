// Request and response shapes for the habits endpoints (/api/v1/habits).
// The API validates requests with these schemas; the web app takes its types from them.

import { z } from 'zod';
import { messageResponseSchema } from './common.js';

/** The days a habit can be scheduled on. */
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type Frequency = (typeof DAYS)[number];

const validDays: readonly string[] = DAYS;

// --- Requests -------------------------------------------------------------

// Common frequency schema
const frequencySchema = z
  .array(z.string())
  .min(1, 'Frequency is required and must be a non-empty array.')
  .refine((days) => days.every((day) => validDays.includes(day)), {
    message: `Frequency array must only contain valid days: ${validDays.join(', ')}`,
  })
  .refine((days) => new Set(days).size === days.length, {
    message: 'Frequency array cannot contain duplicate days.',
  });

// One definition of the date-range invariant, shared by create and update.
// Null-safe on both ends so it stays correct if either field becomes optional.
const hasValidDateRange = (data: {
  startDate?: string;
  endDate?: string | null;
}): boolean => {
  if (!data.startDate || !data.endDate) return true;
  return new Date(data.endDate).getTime() >= new Date(data.startDate).getTime();
};

const DATE_RANGE_MESSAGE = 'endDate cannot be earlier than startDate.';

// Request validation schemas
export const createHabitSchema = z
  .object({
    name: z.string().min(1).max(100),
    icon: z.string().optional(),
    frequency: frequencySchema,
    startDate: z.string().datetime(),
    endDate: z.union([z.string().datetime(), z.null()]).optional(),
  })
  .refine(hasValidDateRange, { message: DATE_RANGE_MESSAGE });

export const updateHabitSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    icon: z.string().optional(),
    frequency: frequencySchema.optional(),
    startDate: z.string().datetime(),
    endDate: z.union([z.string().datetime(), z.null()]).optional(),
  })
  .refine(hasValidDateRange, { message: DATE_RANGE_MESSAGE });

export const habitIdParamSchema = z.object({
  habitId: z.string(),
});

export const getHabitsByDateSchema = z.object({
  date: z.string().datetime().optional(),
  timeZone: z.string().default('UTC'),
});

export const getTrackersSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const manageTrackerSchema = z.object({
  timestamp: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{3})?Z$/),
  timeZone: z.string().default('UTC'),
  notes: z.string().max(500).optional(),
});

export const getHabitStatsSchema = z.object({
  timeZone: z.string().default('UTC'),
});

export type CreateHabitRequest = z.input<typeof createHabitSchema>;
export type UpdateHabitRequest = z.input<typeof updateHabitSchema>;
export type HabitsQuery = z.input<typeof getHabitsByDateSchema>;
export type TrackersQuery = z.input<typeof getTrackersSchema>;
export type ToggleTrackerRequest = z.input<typeof manageTrackerSchema>;
export type HabitStatsQuery = z.input<typeof getHabitStatsSchema>;

// --- Responses ------------------------------------------------------------

/**
 * One habit as GET /habits returns it. `icon` and `endDate` are left out
 * when the habit has none; they are never null.
 */
export const habitSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  frequency: z.array(z.enum(DAYS)),
  startDate: z.string(),
  endDate: z.string().optional(),
  completed: z.boolean(),
});

export const habitListResponseSchema = z.array(habitSchema);

export const createHabitResponseSchema = z.object({
  message: z.string(),
  habitId: z.string(),
});

// Update, delete and restore answer with a message only.
export const updateHabitResponseSchema = messageResponseSchema;
export const deleteHabitResponseSchema = messageResponseSchema;
export const restoreHabitResponseSchema = messageResponseSchema;

export const trackerSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  timestamp: z.string(),
  notes: z.string().optional(),
});

export const trackersResponseSchema = z.object({
  trackers: z.array(trackerSchema),
});

/**
 * Toggling a completion answers 201 with the new tracker's id when it adds
 * one, and 200 without an id when it removes one.
 */
export const toggleTrackerResponseSchema = z.object({
  message: z.string(),
  trackerId: z.string().optional(),
});

/** `lastCompleted` is left out, not null, for a habit never completed. */
export const habitStatsResponseSchema = z.object({
  streak: z.number(),
  longestStreak: z.number(),
  totalCompletions: z.number(),
  lastCompleted: z.string().optional(),
});

export type HabitResponse = z.infer<typeof habitSchema>;
export type HabitListResponse = z.infer<typeof habitListResponseSchema>;
export type CreateHabitResponse = z.infer<typeof createHabitResponseSchema>;
export type UpdateHabitResponse = z.infer<typeof updateHabitResponseSchema>;
export type DeleteHabitResponse = z.infer<typeof deleteHabitResponseSchema>;
export type RestoreHabitResponse = z.infer<typeof restoreHabitResponseSchema>;
export type TrackerResponse = z.infer<typeof trackerSchema>;
export type TrackersResponse = z.infer<typeof trackersResponseSchema>;
export type ToggleTrackerResponse = z.infer<typeof toggleTrackerResponseSchema>;
export type HabitStatsResponse = z.infer<typeof habitStatsResponseSchema>;
