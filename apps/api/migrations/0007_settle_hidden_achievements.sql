-- Retires the achievements that repeat another or cannot be measured, and gives Habit Guru and Habit Legend clear targets.
-- Retired rows stay, with any earned ones, but no longer show or count toward totals.

-- Perfectionist is Two Weeks Strong: 14 perfect days in a row. Minimalist and
-- the second Habit Architect have no clear rule; Variety Seeker needs habit
-- types, which habits do not have.
UPDATE achievements
SET is_active = 0
WHERE key IN ('perfectionist', 'minimalist', 'habit_architect_advanced', 'habit_variety');

UPDATE achievements
SET description = 'Complete 90% of your habits over 30 days in a row'
WHERE key = 'habit_guru';

UPDATE achievements
SET description = 'Earn 30 achievements', requirement_value = 30
WHERE key = 'habit_legend';
