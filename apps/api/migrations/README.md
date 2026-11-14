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
