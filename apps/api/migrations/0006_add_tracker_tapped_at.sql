-- Adds when each check-in was tapped, as the app saw it, so a check-in made offline and sent later keeps its time of day.
-- Nullable: check-ins from before, and from apps that do not send it, fall back to created_at.

ALTER TABLE trackers ADD COLUMN tapped_at TEXT;
