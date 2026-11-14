-- Sample data for local development, loaded by `pnpm db:seed`.
-- Kept outside migrations/ on purpose: every .sql file there is applied to production.

INSERT OR IGNORE INTO users (clerk_user_id) VALUES ('user_test123');

INSERT OR IGNORE INTO habits (user_id, name, icon, frequency, start_date)
VALUES
  ('user_test123', 'Morning Exercise', '🏃', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', '2024-01-01'),
  ('user_test123', 'Read Books', '📚', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', '2024-01-01'),
  ('user_test123', 'Drink Water', '💧', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', '2024-01-01');
