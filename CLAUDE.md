# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Repository Layout

A pnpm workspace with two apps and one shared package. Each app keeps its
own `CLAUDE.md` with its architecture, conventions and testing notes; read
that file before working inside the app.

```
apps/
├── web/        # @tracknstick/web: React 19 + Vite PWA        -> apps/web/CLAUDE.md
└── api/        # @tracknstick/api: Hono on Cloudflare Workers -> apps/api/CLAUDE.md
packages/
└── contracts/  # @tracknstick/contracts: zod schemas for every request and response
```

The web app calls the API at `/api/v1/*`. Each request and response shape is
defined once, in `packages/contracts`: the API validates requests with its
schemas, and the web app imports only its types (`import type`; ESLint
rejects a value import, which would bundle zod). The package is plain
TypeScript source with no build step. `apps/api/src/tests/contract.test.ts`
calls every endpoint on a real local D1 database and checks each response
against its schema, so a change to an endpoint's shape starts there.

## Commands

Install once at the root; both apps share the root `pnpm-lock.yaml`.

- `pnpm install` - Install dependencies for both apps
- `pnpm dev:web` - Start the web dev server
- `pnpm dev:api` - Start the API locally against a local D1 database
- `pnpm build` - Build both apps
- `pnpm lint` - Lint both apps
- `pnpm test` - Run both test suites once

Run any other app script with a filter, or from inside the app's directory:

```
pnpm --filter @tracknstick/web test:run
pnpm --filter @tracknstick/api db:migrate
```

The API's test environment loads the compiled entry point, so run its
`build` before its `test`. `pnpm test` at the root does this for you.

The API develops against a local D1 database built from
`apps/api/migrations`. Run `pnpm --filter @tracknstick/api db:migrate` once,
and again after pulling new migrations. The API's `dev:remote` script
connects to the production database instead; avoid it unless production data
is needed.

### Quality Checks Before Committing

1. `pnpm --filter @tracknstick/web lint:fix` and
   `pnpm --filter @tracknstick/api lint:fix`
2. `pnpm test`
3. `pnpm build`

## Workspace Conventions

- Add a dependency to the app that uses it:
  `pnpm --filter @tracknstick/web add <package>`. The root `package.json`
  holds only repository tooling (husky).
- Build-script approvals for every package live in `pnpm-workspace.yaml`.
- The pre-commit hook runs lint-staged inside `apps/web`. It has to start
  there: with a single config, lint-staged runs its tasks from the directory
  it was started in, and ESLint looks for its config from that directory.
- After changing the workspace layout, reinstall from scratch
  (`rm -rf node_modules apps/*/node_modules && pnpm install`). Installing
  over an existing `node_modules` can leave the apps' direct dependencies out
  of the root `node_modules`, and libraries then fail to find `@types/react`.

## CI and Deployment

- `.github/workflows/ci.yml` runs one job per package on every branch and
  pull request.
- The web app is built and deployed by Cloudflare Pages from this
  repository. Its build settings (build command and output directory
  `apps/web/dist`) are configured in the Cloudflare dashboard, not in a file
  here.
- The API is deployed by `.github/workflows/deploy-api.yml` on a push to
  `main` that touches `apps/api`, `packages/contracts`, the lockfile or the
  workspace files. It
  applies pending database migrations to production before it deploys.
- Schema changes are new numbered files in `apps/api/migrations`; see the
  README there. Every `.sql` file in that folder is applied to production, so
  nothing else belongs in it.

## Commits

Short imperative subject ("Fix Welcome overflow"), with a body when the
reason is not obvious from the diff.
