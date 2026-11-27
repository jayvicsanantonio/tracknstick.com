-- Rewords the descriptions of Early Bird, Night Owl and Weekend Warrior to say what they count.
-- Each counts days, not a run of days or weeks in a row.

UPDATE achievements
SET description = 'Check off a habit before 8 AM on 7 days'
WHERE key = 'early_bird';

UPDATE achievements
SET description = 'Check off a habit after 10 PM on 7 days'
WHERE key = 'night_owl';

UPDATE achievements
SET description = 'Check in on 8 weekend days'
WHERE key = 'weekend_warrior';
