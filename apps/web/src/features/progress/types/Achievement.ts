// Achievement types for frontend
// Each is the API's response shape from the contracts package, under the name the web app uses.

export type {
  AchievementResponse as Achievement,
  AchievementProgress,
  EarnedAchievementResponse as UserAchievement,
  AchievementStatsResponse as AchievementStats,
  CheckAchievementsResponse as AchievementCheckResponse,
} from '@tracknstick/contracts';
