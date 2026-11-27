// Repository for achievement data operations
// Handles database interactions for achievements and user achievements

import type { D1Database } from '@cloudflare/workers-types';
import { Achievement, UserAchievement } from '../types/index.js';

/** One consistent read of everything achievement rules measure. */
export interface UserHabitStats {
  totalHabits: number;
  totalCompletions: number;
  currentStreaks: number[];
  notedCompletions: number;
}

export class AchievementRepository {
  constructor(private db: D1Database) {}

  async getAllAchievements(): Promise<Achievement[]> {
    const results = await this.db
      .prepare(
        `
        SELECT 
          id, key, name, description, icon, type, category,
          requirement_type as requirementType,
          requirement_value as requirementValue,
          requirement_data as requirementData,
          is_active as isActive,
          created_at as createdAt
        FROM achievements 
        WHERE is_active = 1
        ORDER BY category, type, requirement_value
      `
      )
      .all<Record<string, unknown>>();

    return results.results.map((row) => ({
      id: row.id as number,
      key: row.key as string,
      name: row.name as string,
      description: row.description as string,
      icon: row.icon as Achievement['icon'],
      type: row.type as Achievement['type'],
      category: row.category as Achievement['category'],
      requirementType: row.requirementType as Achievement['requirementType'],
      requirementValue: row.requirementValue as number,
      requirementData: row.requirementData as string,
      isActive: Boolean(row.isActive),
      createdAt: row.createdAt as string,
    }));
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const results = await this.db
      .prepare(
        `
        SELECT 
          ua.id, ua.user_id as userId, ua.achievement_id as achievementId,
          ua.earned_at as earnedAt, ua.progress_data as progressData,
          a.key, a.name, a.description, a.icon, a.type, a.category,
          a.requirement_type as requirementType,
          a.requirement_value as requirementValue,
          a.requirement_data as requirementData,
          a.is_active as isActive,
          a.created_at as createdAt
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ? AND a.is_active = 1
        ORDER BY ua.earned_at DESC
      `
      )
      .bind(userId)
      .all();

    return results.results.map((row) => ({
      id: row.id as number,
      userId: row.userId as string,
      achievementId: row.achievementId as number,
      earnedAt: row.earnedAt as string,
      progressData: row.progressData as string,
      achievement: {
        id: row.achievementId as number,
        key: row.key as string,
        name: row.name as string,
        description: row.description as string,
        icon: row.icon as Achievement['icon'],
        type: row.type as Achievement['type'],
        category: row.category as Achievement['category'],
        requirementType: row.requirementType as Achievement['requirementType'],
        requirementValue: row.requirementValue as number,
        requirementData: row.requirementData as string,
        isActive: Boolean(row.isActive),
        createdAt: row.createdAt as string,
      },
    }));
  }

  async earnAchievement(
    userId: string,
    achievementId: number,
    progressData?: unknown
  ): Promise<void> {
    await this.db
      .prepare(
        `
        INSERT INTO user_achievements (user_id, achievement_id, progress_data)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, achievement_id) DO NOTHING
      `
      )
      .bind(
        userId,
        achievementId,
        progressData ? JSON.stringify(progressData) : null
      )
      .run();
  }

  async hasUserEarnedAchievement(
    userId: string,
    achievementId: number
  ): Promise<boolean> {
    const result = await this.db
      .prepare(
        `
        SELECT 1 FROM user_achievements 
        WHERE user_id = ? AND achievement_id = ?
      `
      )
      .bind(userId, achievementId)
      .first();

    return !!result;
  }

  async getUserHabitStats(userId: string): Promise<UserHabitStats> {
    // One batch instead of four sequential round trips. D1 runs a batch as an
    // implicit transaction, so every figure below describes the same instant.
    const [habitCount, completions, currentStreaks, notedCompletions] =
      await this.db.batch<Record<string, unknown>>([
        this.db
          .prepare(
            `SELECT COUNT(*) as count FROM habits WHERE user_id = ? AND deleted_at IS NULL`
          )
          .bind(userId),
        this.db
          .prepare(
            `SELECT COUNT(*) as count FROM trackers WHERE user_id = ? AND deleted_at IS NULL`
          )
          .bind(userId),
        this.db
          .prepare(
            `SELECT streak FROM habits WHERE user_id = ? AND deleted_at IS NULL AND streak > 0`
          )
          .bind(userId),
        this.db
          .prepare(
            `SELECT COUNT(*) as count FROM trackers
           WHERE user_id = ? AND deleted_at IS NULL
             AND notes IS NOT NULL AND TRIM(notes) != ''`
          )
          .bind(userId),
      ]);

    const first = (r: D1Result<Record<string, unknown>>) =>
      r.results?.[0] ?? {};

    return {
      totalHabits: (first(habitCount).count as number) || 0,
      totalCompletions: (first(completions).count as number) || 0,
      currentStreaks: (
        (currentStreaks.results ?? []) as { streak: number }[]
      ).map((row) => row.streak),
      notedCompletions: (first(notedCompletions).count as number) || 0,
    };
  }
}
