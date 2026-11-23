# End-to-end tests

Playwright drives this web app against the API, both running locally, signed in
as a Clerk test user from the **development** instance.

## What a run starts

- `e2e/serveApi.mjs`: deletes and recreates a local D1 database in
  `apps/api/.wrangler/e2e-state`, applies `apps/api/migrations`, then runs
  `wrangler dev --local` on port 8787. Your `pnpm dev:api` database is not
  touched. The API runs from `apps/api/.wrangler/e2e-config/wrangler.toml`
  (gitignored), a copy of `wrangler.toml` with the per-IP API, habits and
  progress rate limits raised to 1000 a minute: the suite sends more requests a
  minute from one IP than the production limits allow. `e2e/testApiConfig.mjs`
  builds it. The copy has a folder of its own so that its Wrangler build files
  are kept apart from those of a running `pnpm dev:api`, which a run can start
  beside safely.
- Vite on port 5174, pointed at that API.
- A production build in `e2e/.dist` (gitignored), served by `vite preview` on
  port 4174, which the API is started to accept. Only a production build has a
  service worker, so the "production build" project (`offline.e2e.ts` and
  `serviceWorker.e2e.ts`) runs against it.
- `e2e/auth.setup.ts`: signs in once with `@clerk/testing` and saves the session
  to `e2e/.auth/user.json` (gitignored) for the other tests.

## Run locally

1. `apps/api/.dev.vars` must hold `ENVIRONMENT=development` and the development
   instance's `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` (`sk_test_…`,
   `pk_test_…`). Playwright reads the keys from there too.
2. Create `apps/web/.env.e2e.local` (gitignored) with the test user's email:

   ```
   E2E_CLERK_USER_EMAIL=e2e+clerk_test@example.com
   ```

   The user must have no two-factor authentication. A `+clerk_test` address
   means Clerk never sends it email.

3. Install the browser once:
   `pnpm --filter @tracknstick/web exec playwright install chromium`
4. From the repository root: `pnpm test:e2e`

## In CI

The `E2E` job in `.github/workflows/ci.yml` uses the `e2e` GitHub environment,
which holds `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` and
`E2E_CLERK_USER_EMAIL`. It writes the API's `.dev.vars` from them before the
run.
