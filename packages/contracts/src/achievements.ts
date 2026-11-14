// Response shapes for the achievements endpoints (/api/v1/achievements).
// These endpoints take no request body or query, so there are no request schemas.

import { z } from 'zod';
import { messageResponseSchema } from './common.js';

export const ACHIEVEMENT_TYPES = [
  'habit_creation',
  'streak',
  'completion',
  'special_achievement',
  'perfect_completion',
  'activity_tracking',
] as const;

export const ACHIEVEMENT_CATEGORIES = [
  'getting_started',
  'consistency',
  'dedication',
  'milestones',
] as const;

export const ACHIEVEMENT_REQUIREMENT_TYPES = [
  'count',
  'streak',
  'days',
  'percentage',
] as const;

/** How far a user is toward an achievement they have not earned yet. */
export const achievementProgressSchema = z.object({
  achievementId: z.number(),
  currentValue: z.number(),
  targetValue: z.number(),
  isEarned: z.boolean(),
  progressPercentage: z.number(),
});

/**
 * One achievement from the catalogue, with the signed-in user's standing.
 * `earnedAt` is present once earned; `progress` is present while it is not,
 * unless the achievement has no measurable metric.
 */
export const achievementSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  type: z.enum(ACHIEVEMENT_TYPES),
  category: z.enum(ACHIEVEMENT_CATEGORIES),
  requirementType: z.enum(ACHIEVEMENT_REQUIREMENT_TYPES),
  requirementValue: z.number(),
  requirementData: z.unknown().optional(),
  isEarned: z.boolean(),
  earnedAt: z.string().optional(),
  progress: achievementProgressSchema.optional(),
});

/** GET /achievements */
export const achievementListResponseSchema = z.object({
  achievements: z.array(achievementSchema),
});

/** One achievement the user has earned, as GET /achievements/earned lists it. */
export const earnedAchievementSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  type: z.enum(ACHIEVEMENT_TYPES),
  category: z.enum(ACHIEVEMENT_CATEGORIES),
  earnedAt: z.string(),
  progressData: z.unknown().optional(),
});

/** GET /achievements/earned */
export const earnedAchievementsResponseSchema = z.object({
  achievements: z.array(earnedAchievementSchema),
});

/** A recently earned achievement inside the stats response. It has no `type`. */
export const recentAchievementSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  category: z.enum(ACHIEVEMENT_CATEGORIES),
  earnedAt: z.string(),
});

/** GET /achievements/stats */
export const achievementStatsResponseSchema = z.object({
  totalAchievements: z.number(),
  earnedAchievements: z.number(),
  completionPercentage: z.number(),
  categoryStats: z.record(
    z.string(),
    z.object({ total: z.number(), earned: z.number() })
  ),
  recentAchievements: z.array(recentAchievementSchema),
});

/** An achievement just awarded by POST /achievements/check. */
export const awardedAchievementSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  type: z.enum(ACHIEVEMENT_TYPES),
  category: z.enum(ACHIEVEMENT_CATEGORIES),
});

/** POST /achievements/check */
export const checkAchievementsResponseSchema = z.object({
  message: z.string(),
  newAchievements: z.array(awardedAchievementSchema),
  count: z.number(),
});

/** POST /achievements/initialize */
export const initializeAchievementsResponseSchema = messageResponseSchema;

export type AchievementProgress = z.infer<typeof achievementProgressSchema>;
export type AchievementResponse = z.infer<typeof achievementSchema>;
export type AchievementListResponse = z.infer<
  typeof achievementListResponseSchema
>;
export type EarnedAchievementResponse = z.infer<typeof earnedAchievementSchema>;
export type EarnedAchievementsResponse = z.infer<
  typeof earnedAchievementsResponseSchema
>;
export type RecentAchievementResponse = z.infer<typeof recentAchievementSchema>;
export type AchievementStatsResponse = z.infer<
  typeof achievementStatsResponseSchema
>;
export type AwardedAchievementResponse = z.infer<
  typeof awardedAchievementSchema
>;
export type CheckAchievementsResponse = z.infer<
  typeof checkAchievementsResponseSchema
>;
export type InitializeAchievementsResponse = z.infer<
  typeof initializeAchievementsResponseSchema
>;
