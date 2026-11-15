# Operations

How the API is deployed, how to check on it, and fixes for problems that come
up in local development.

## Deployment

`.github/workflows/deploy-api.yml` deploys the Worker `tracknstick-api` on a
push to `main` that touches `apps/api`, `packages/contracts`, the lockfile or
the workspace files. Merging a pull request is that push. The job:

1. installs with `pnpm install --frozen-lockfile`;
2. builds and runs the API's test suite;
3. applies pending migrations to the production D1 database
   (`wrangler d1 migrations apply tracknstick-db --remote`); a migration that
   fails is rolled back and stops the job, so the Worker is never deployed
   against a schema it does not expect;
4. deploys with `cloudflare/wrangler-action`.

Because migrations go live before the code, a migration must work with the
code that is already deployed. See [`migrations/README.md`](../migrations/README.md).

The production URL is `https://tracknstick-api.hi-00e.workers.dev`.

### Secrets

- GitHub `production` environment: `CF_API_TOKEN` (a Cloudflare API token
  that can deploy Workers and edit D1) and `CF_ACCOUNT_ID`.
- The Worker itself, set once with `wrangler secret put <NAME>`:
  `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` and `PINECONE_API_KEY`.
  `wrangler.toml` sets `keep_vars = true`, so a deploy leaves them in place.
- Local development reads the same names from `.dev.vars` (gitignored); copy
  `.dev.vars.example` and use the Clerk **development** instance's keys.

## Checking on the API

- `GET /health` answers without touching the database: status, environment
  and time.
- `GET /health/db` runs a query and reports the database's status and
  response time, with a 500 when it fails.
- `GET /health/details` reports the same check as a component of the
  overall status, with a 503 when the database fails.
- Workers Logs are on (`[observability.logs]` in `wrangler.toml`): every line
  the logger writes is in the Cloudflare dashboard under the Worker's Logs tab,
  along with request counts, errors and CPU time on its Metrics tab.
- Log lines are `[timestamp] [LEVEL] [api] message {json context}`. A request
  the API refuses (a 4xx) is one `WARN Client error occurred` line with the
  reason; a failure is `ERROR` and includes the error.

## Local development problems

### `D1_ERROR: no such table`

The local database is missing migrations. From the repository root:

```bash
pnpm --filter @tracknstick/api db:migrate
```

Run it again after pulling new migrations. `db:reset` deletes the local
database and rebuilds it from the migrations; `db:seed` adds sample data.

### Every request is a 401

The API checks tokens against the Clerk instance whose keys are in
`.dev.vars`. The web app must use the same instance: its
`VITE_CLERK_PUBLISHABLE_KEY` must be that instance's publishable key, and
`.dev.vars` must set `ENVIRONMENT=development` so the localhost origins are
allowed.

### The chat answers with an error

`pnpm dev:local` runs with nothing remote, so the chat cannot reach Workers
AI. Use `pnpm dev`, which calls Workers AI through Cloudflare and needs
`wrangler login`. Retrieval also needs `PINECONE_API_KEY`; without it the chat
still answers, with no passages from the book.
