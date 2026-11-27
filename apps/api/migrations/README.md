# Database Migrations

The database schema is the set of numbered `.sql` files in this directory,
applied in file-name order. Wrangler records which files a database has
already run in a `d1_migrations` table, so each file runs once per database.

**Only migration files belong here.** Wrangler treats every `.sql` file in
this directory as a migration and applies it to production. Seed data lives in
`scripts/seed.sql` for that reason, and a test (`src/tests/migrations.test.ts`)
fails if a file here is not named like `0002_add_something.sql`.

## Files

- `0001_initial_schema.sql` - The baseline: every table and index the API had
  when it moved to versioned migrations. It is not edited again.
- `0002_drop_knex_tables.sql` - Drops `knex_migrations` and
  `knex_migrations_lock`, left in production by the knex setup that came
  before wrangler migrations.
- `0003_seed_achievements.sql` - Seeds the achievement catalogue, one row per
  achievement, upserted by `key` so ids and earned achievements survive. A
  change to the catalogue is a new migration that upserts the changed rows.
- `0004_reword_achievement_descriptions.sql` - Rewords the descriptions of
  Perfect Week, Perfect Month and Time Traveler to say what they count.
- `0005_reword_time_of_day_achievements.sql` - Rewords the descriptions of
  Early Bird, Night Owl and Weekend Warrior, which count days, not runs.
- `0006_add_tracker_tapped_at.sql` - Adds `trackers.tapped_at`, when the app
  says a check-in was tapped, so one sent later keeps its time of day.
- `0007_settle_hidden_achievements.sql` - Retires Perfectionist, Minimalist,
  Variety Seeker and the second Habit Architect, and gives Habit Guru and
  Habit Legend clear targets.

## Changing the Schema

1. Create the next file:

   ```bash
   pnpm exec wrangler d1 migrations create tracknstick-db add_something
   ```

2. Write the SQL for the change in the new file.
3. Apply it to your local database and try it out:

   ```bash
   pnpm db:migrate
   ```

4. Open a pull request. When it merges, the deploy workflow applies the new
   file to production and then deploys the code.

Two rules keep this safe:

- **Never edit or delete a file that has been merged.** Databases that have
  already run it will not run it again. Write a new migration instead.
- **Make each change work with the code that is already live.** The migration
  runs shortly before the new code is deployed, so for that moment the old
  code runs against the new schema. Add columns and tables first; remove or
  rename them in a later migration, once no deployed code uses them.

If a migration fails in the deploy workflow, wrangler rolls it back, the job
stops, and the API is not deployed.

## Local Development

`pnpm dev` uses a local database that wrangler keeps under `.wrangler/state`.

```bash
# Create or update the local database from the migrations
pnpm db:migrate

# Add sample data
pnpm db:seed

# Start over: delete the local database and rebuild it from the migrations
pnpm db:reset

# Run SQL queries
pnpm db:query "SELECT COUNT(*) FROM habits"
```

Stop `pnpm dev` before running `pnpm db:reset`.

## Production

```bash
# List migrations production has not run yet
pnpm exec wrangler d1 migrations list tracknstick-db --remote

# Apply them by hand (the deploy workflow normally does this)
pnpm db:migrate:remote

# Query production
pnpm db:query:remote "SELECT COUNT(*) FROM users"
```

`db:reset` and `db:seed` refuse to run against production. D1 keeps its own
point-in-time history (Time Travel), which is the way to recover production
data:

```bash
pnpm exec wrangler d1 time-travel info tracknstick-db
```

## Help

```bash
pnpm db:setup help
```
