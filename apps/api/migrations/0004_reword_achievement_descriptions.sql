-- Rewords achievement descriptions that promised more than their metric counts.
-- Perfect Week and Perfect Month count perfect days in total, not in a row, and Time Traveler counts active days.

UPDATE achievements
SET description = 'Have 7 perfect days, when you complete every habit'
WHERE key = 'perfect_week';

UPDATE achievements
SET description = 'Have 30 perfect days, when you complete every habit'
WHERE key = 'perfect_month';

UPDATE achievements
SET description = 'Check in on 180 different days'
WHERE key = 'time_traveler';
