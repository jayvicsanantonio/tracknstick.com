-- Seeds the achievement catalogue: one row per achievement, upserted by key.
-- A row keeps its id when the seed runs again, so the achievements users have earned stay attached.

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('first_habit', 'First Step', 'Create your very first habit', 'Sprout', 'habit_creation', 'getting_started', 'count', 1, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('first_completion', 'Getting Started', 'Complete your first habit', 'CheckCircle', 'completion', 'getting_started', 'count', 1, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('three_habits', 'Building Momentum', 'Create 3 habits', 'Target', 'habit_creation', 'getting_started', 'count', 3, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('five_habits', 'Habit Collector', 'Create 5 habits', 'BookOpen', 'habit_creation', 'getting_started', 'count', 5, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('first_week', 'Week Warrior', 'Complete habits for 7 days', 'Calendar', 'special_achievement', 'getting_started', 'days', 7, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('streak_3', 'On a Roll', 'Maintain a 3-day streak', 'Flame', 'streak', 'consistency', 'streak', 3, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('streak_7', 'Week Streak', 'Maintain a 7-day streak', 'Zap', 'streak', 'consistency', 'streak', 7, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('streak_14', 'Two Weeks Strong', 'Maintain a 14-day streak', 'Shield', 'streak', 'consistency', 'streak', 14, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('streak_21', 'Habit Former', 'Maintain a 21-day streak', 'Medal', 'streak', 'consistency', 'streak', 21, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('streak_30', 'Month Master', 'Maintain a 30-day streak', 'Crown', 'streak', 'consistency', 'streak', 30, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('streak_50', 'Fifty Days', 'Maintain a 50-day streak', 'Star', 'streak', 'consistency', 'streak', 50, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('streak_66', 'Habit Scientist', 'Maintain a 66-day streak (average time to form a habit)', 'Activity', 'streak', 'consistency', 'streak', 66, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('streak_100', 'Centurion', 'Maintain a 100-day streak', 'Building', 'streak', 'consistency', 'streak', 100, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('perfect_week', 'Perfect Week', 'Complete all habits every day for a week', 'Star', 'special_achievement', 'consistency', 'days', 7, '{"type": "perfect_days"}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('perfect_month', 'Perfect Month', 'Complete all habits every day for 30 days', 'Moon', 'special_achievement', 'consistency', 'days', 30, '{"type": "perfect_days"}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('completions_10', 'Getting Active', 'Complete habits 10 times', 'Activity', 'completion', 'dedication', 'count', 10, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('completions_25', 'Quarter Century', 'Complete habits 25 times', 'Star', 'completion', 'dedication', 'count', 25, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('completions_50', 'Half Century', 'Complete habits 50 times', 'Target', 'completion', 'dedication', 'count', 50, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('completions_100', 'Century Club', 'Complete habits 100 times', 'Trophy', 'completion', 'dedication', 'count', 100, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('completions_250', 'Dedicated', 'Complete habits 250 times', 'Award', 'completion', 'dedication', 'count', 250, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('completions_500', 'Habit Master', 'Complete habits 500 times', 'Medal', 'completion', 'dedication', 'count', 500, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('completions_1000', 'Legendary', 'Complete habits 1000 times', 'Crown', 'completion', 'dedication', 'count', 1000, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('active_30_days', 'Monthly Active', 'Be active for 30 days', 'TrendingUp', 'special_achievement', 'dedication', 'days', 30, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('active_60_days', 'Bi-Monthly Active', 'Be active for 60 days', 'TrendingUp', 'special_achievement', 'dedication', 'days', 60, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('active_100_days', 'Hundred Day Hero', 'Be active for 100 days', 'Shield', 'special_achievement', 'dedication', 'days', 100, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('ten_habits', 'Habit Enthusiast', 'Create 10 habits', 'Target', 'habit_creation', 'milestones', 'count', 10, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('twenty_habits', 'Habit Architect', 'Create 20 habits', 'Building', 'habit_creation', 'milestones', 'count', 20, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('streak_365', 'Year Long', 'Maintain a 365-day streak', 'Star', 'streak', 'milestones', 'streak', 365, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('streak_500', 'Unstoppable', 'Maintain a 500-day streak', 'Rocket', 'streak', 'milestones', 'streak', 500, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('streak_1000', 'Millennium', 'Maintain a 1000-day streak', 'Zap', 'streak', 'milestones', 'streak', 1000, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('early_bird', 'Early Bird', 'Complete a habit before 8 AM for 7 days', 'Sun', 'special_achievement', 'milestones', 'days', 7, '{"type": "early_morning", "hour": 8}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('night_owl', 'Night Owl', 'Complete a habit after 10 PM for 7 days', 'Moon', 'special_achievement', 'milestones', 'days', 7, '{"type": "late_night", "hour": 22}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('weekend_warrior', 'Weekend Warrior', 'Complete habits on weekends for 4 weeks', 'Shield', 'special_achievement', 'milestones', 'days', 8, '{"type": "weekend_only"}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('comeback_kid', 'Comeback Kid', 'Restart a habit after a 7-day break', 'RefreshCw', 'special_achievement', 'milestones', 'count', 1, '{"type": "habit_restart"}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('habit_variety', 'Variety Seeker', 'Have 5 different types of habits active', 'Heart', 'special_achievement', 'milestones', 'count', 5, '{"type": "habit_variety"}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('social_butterfly', 'Social Butterfly', 'Add notes to habit completions 20 times', 'MessageSquare', 'special_achievement', 'milestones', 'count', 20, '{"type": "notes_added"}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('minimalist', 'Minimalist', 'Maintain just 1 habit for 30 days', 'Activity', 'special_achievement', 'milestones', 'days', 30, '{"type": "single_habit"}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('maximalist', 'Maximalist', 'Complete 10+ habits in a single day', 'Star', 'special_achievement', 'milestones', 'count', 10, '{"type": "single_day_completions"}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('habit_architect_advanced', 'Habit Architect', 'Create, complete, and maintain habits across all frequency types', 'Building', 'special_achievement', 'milestones', 'count', 1, '{"type": "all_frequencies"}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('time_traveler', 'Time Traveler', 'Use TrackNStick for 6 months consistently', 'Timer', 'special_achievement', 'milestones', 'days', 180, NULL, 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('habit_guru', 'Habit Guru', 'Achieve 90% completion rate across all habits for 30 days', 'User', 'special_achievement', 'milestones', 'percentage', 90, '{"type": "completion_rate", "days": 30}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('phoenix', 'Phoenix', 'Restart tracking after a 30-day absence', 'Flame', 'special_achievement', 'milestones', 'count', 1, '{"type": "long_comeback", "days": 30}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('perfectionist', 'Perfectionist', 'Achieve 100% completion rate for 14 consecutive days', 'Star', 'special_achievement', 'milestones', 'percentage', 100, '{"type": "perfect_rate", "days": 14}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;

INSERT INTO achievements
  (key, name, description, icon, type, category, requirement_type, requirement_value, requirement_data, is_active)
VALUES
  ('habit_legend', 'Habit Legend', 'Complete 50 different achievements', 'Crown', 'special_achievement', 'milestones', 'count', 40, '{"type": "achievement_count"}', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  type = excluded.type,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value,
  requirement_data = excluded.requirement_data,
  is_active = excluded.is_active;
