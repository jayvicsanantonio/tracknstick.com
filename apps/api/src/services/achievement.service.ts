// Service for achievement business logic
// Handles achievement processing, evaluation, and progress tracking

import type { D1Database } from '@cloudflare/workers-types';
import { AchievementRepository } from '../repositories/achievement.repository.js';
import { getUserStreaks } from '../repositories/tracker.repository.js';
import {
  TRACKS,
  isMeasurable,
  measure,
  type UserStatsSnapshot,
} from './achievementMetrics.js';
import type {
  AchievementProgress,
  AchievementResponse,
} from '@tracknstick/contracts';
import { Achievement, UserAchievement } from '../types/index.js';

export class AchievementService {
  private repository: AchievementRepository;
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
    this.repository = new AchievementRepository(db);
  }

  /**
   * The catalogue with the user's standing in each. An achievement with no
   * metric can never be earned, so it is left out unless the user already
   * holds it.
   */
  async getAllAchievementsForUser(
    userId: string,
    timeZone = 'UTC'
  ): Promise<AchievementResponse[]> {
    const [allAchievements, userAchievements, snapshot] = await Promise.all([
      this.repository.getAllAchievements(),
      this.repository.getUserAchievements(userId),
      this.buildSnapshot(userId, timeZone),
    ]);

    const userAchievementMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua])
    );

    const shown = allAchievements.filter(
      (achievement) =>
        isMeasurable(achievement) || userAchievementMap.has(achievement.id)
    );

    return shown.map((achievement) => {
      const userAchievement = userAchievementMap.get(achievement.id);
      const isEarned = !!userAchievement;

      return {
        id: achievement.id.toString(),
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        type: achievement.type,
        category: achievement.category,
        ...(TRACKS[achievement.key] ? { track: TRACKS[achievement.key] } : {}),
        requirementType: achievement.requirementType,
        requirementValue: achievement.requirementValue,
        requirementData: achievement.requirementData
          ? (JSON.parse(achievement.requirementData) as unknown)
          : undefined,
        isEarned,
        earnedAt: userAchievement?.earnedAt,
        progress: isEarned
          ? undefined
          : this.calculateProgress(achievement, snapshot),
      };
    });
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await this.repository.getUserAchievements(userId);
  }

  async checkAndAwardAchievements(
    userId: string,
    timeZone = 'UTC'
  ): Promise<Achievement[]> {
    const allAchievements = await this.repository.getAllAchievements();
    const userAchievements = await this.repository.getUserAchievements(userId);
    const earnedAchievementIds = new Set(
      userAchievements.map((ua) => ua.achievementId)
    );

    // One snapshot for the whole pass: nothing in the evaluation path reads
    // user_achievements, so awarding cannot change what the rules measure.
    const snapshot = await this.buildSnapshot(userId, timeZone);

    const newlyEarned: Achievement[] = [];

    for (const achievement of allAchievements) {
      if (earnedAchievementIds.has(achievement.id)) continue;

      if (this.evaluateAchievement(achievement, snapshot)) {
        await this.repository.earnAchievement(userId, achievement.id);
        newlyEarned.push(achievement);
      }
    }

    return newlyEarned;
  }

  /**
   * Builds the one consistent read of user state that every rule measures.
   * Required rather than optional: an absent snapshot previously meant two
   * consumers refetched under different conditions, so "zero" and "unknown"
   * were indistinguishable.
   */
  private async buildSnapshot(
    userId: string,
    timeZone: string
  ): Promise<UserStatsSnapshot> {
    const [stats, streaks] = await Promise.all([
      this.repository.getUserHabitStats(userId),
      getUserStreaks(this.db, userId, timeZone),
    ]);

    return {
      ...stats,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
    };
  }

  private calculateProgress(
    achievement: Achievement,
    snapshot: UserStatsSnapshot
  ): AchievementProgress | undefined {
    const currentValue = measure(achievement, snapshot);

    // null means this achievement has no registered metric, so there is no
    // honest progress to report -- better than a well-formed false zero.
    if (currentValue === null) return undefined;

    const progressPercentage = Math.min(
      100,
      (currentValue / achievement.requirementValue) * 100
    );

    return {
      achievementId: achievement.id,
      currentValue,
      targetValue: achievement.requirementValue,
      isEarned: false,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
    };
  }

  private evaluateAchievement(
    achievement: Achievement,
    snapshot: UserStatsSnapshot
  ): boolean {
    const currentValue = measure(achievement, snapshot);
    if (currentValue === null) return false;
    return currentValue >= achievement.requirementValue;
  }
}

// Factory function to create service instance
export const createAchievementService = (db: D1Database) => {
  return new AchievementService(db);
};

// Convenience functions for controllers
export const getAllAchievementsForUser = async (
  userId: string,
  db: D1Database,
  timeZone?: string
): Promise<AchievementResponse[]> => {
  const service = createAchievementService(db);
  return service.getAllAchievementsForUser(userId, timeZone);
};

export const getUserAchievements = async (
  userId: string,
  db: D1Database
): Promise<UserAchievement[]> => {
  const service = createAchievementService(db);
  return service.getUserAchievements(userId);
};

export const checkAndAwardAchievements = async (
  userId: string,
  db: D1Database,
  timeZone?: string
): Promise<Achievement[]> => {
  const service = createAchievementService(db);
  return service.checkAndAwardAchievements(userId, timeZone);
};
