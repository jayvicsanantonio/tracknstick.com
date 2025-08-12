// Achievement types for frontend
// Defines TypeScript interfaces for achievement-related data

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon?: string;
  type: 'habit_creation' | 'streak' | 'completion' | 'special_achievement' | 'perfect_completion' | 'activity_tracking';
  category: 'getting_started' | 'consistency' | 'dedication' | 'milestones';
  requirementType: 'count' | 'streak' | 'days' | 'percentage';
  requirementValue: number;
  requirementData?: any;
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

export interface UserAchievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon?: string;
  type: string;
  category: string;
  earnedAt: string;
  progressData?: any;
}

export interface AchievementStats {
  totalAchievements: number;
  earnedAchievements: number;
  completionPercentage: number;
  categoryStats: Record<string, {
    total: number;
    earned: number;
  }>;
  recentAchievements: UserAchievement[];
}

export interface AchievementCheckResponse {
  message: string;
  newAchievements: Achievement[];
  count: number;
}