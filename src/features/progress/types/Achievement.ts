// Achievement types for frontend
// Defines TypeScript interfaces for achievement-related data

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon?: string;
  type:
    | 'habit_creation'
    | 'streak'
    | 'completion'
    | 'special_achievement'
    | 'perfect_completion'
    | 'activity_tracking';
  category: 'getting_started' | 'consistency' | 'dedication' | 'milestones';
  requirementType: 'count' | 'streak' | 'days' | 'percentage';
  requirementValue: number;
  requirementData?: Record<string, unknown>;
  isEarned: boolean;
  earnedAt?: string;
  progress?: AchievementProgress;
}

export interface AchievementProgress {
  achievementId: number;
  currentValue: number;
  targetValue: number;
  isEarned: boolean;
  progressPercentage: number;
}

/** GET /api/v1/achievements/earned */
export interface UserAchievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon?: string;
  type: string;
  category: string;
  earnedAt: string;
  progressData?: Record<string, unknown>;
}

/**
 * The abbreviated form the server sends for an achievement it has just
 * awarded, or lists as recently earned. Deliberately not `Achievement`:
 * neither response carries the requirement or progress fields, so typing
 * them as present invited reads that are always undefined.
 */
export interface AchievementSummary {
  id: string;
  key: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  earnedAt: string;
}

export interface AchievementStats {
  totalAchievements: number;
  earnedAchievements: number;
  completionPercentage: number;
  categoryStats: Record<
    string,
    {
      total: number;
      earned: number;
    }
  >;
  recentAchievements: AchievementSummary[];
}

export interface AchievementCheckResponse {
  message: string;
  newAchievements: Omit<AchievementSummary, 'earnedAt'>[];
  count: number;
}
