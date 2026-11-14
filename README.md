# Track N' Stick

A habit tracker: a React web app and the API behind it, in one repository.

**Live app:** [tracknstick.com](https://tracknstick.com)

## Layout

| Path                   | What it is                                            | Deployed by                               |
| ---------------------- | ----------------------------------------------------- | ----------------------------------------- |
| [`apps/web`](apps/web) | React 19 + Vite progressive web app                   | Cloudflare Pages, on push to `main`       |
| [`apps/api`](apps/api) | Hono API on Cloudflare Workers, with a D1 database    | GitHub Actions (`deploy-api.yml`)         |

Each app has its own README with setup details, architecture and environment
variables.

## Getting started

Requires Node 22 and pnpm (the version is pinned in `package.json`).

```bash
pnpm install
```

Dependencies for both apps install from the single lockfile at the root. Then
give each app its local environment file:

- `apps/web/.env.local`, starting from `apps/web/.env.example`
- the API's local secrets, described in the [API README](apps/api/README.md)

## Commands

Run these from the repository root.

| Command        | What it does                                              |
| -------------- | --------------------------------------------------------- |
| `pnpm dev:web` | Starts the web app's dev server                           |
| `pnpm dev:api` | Starts the API locally, against a local database          |
| `pnpm build`   | Builds both apps                                          |
| `pnpm lint`    | Lints the web app                                         |
| `pnpm test`    | Runs both apps' test suites once                          |

To run any other script from one app, use a filter:

```bash
pnpm --filter @tracknstick/web test:coverage
pnpm --filter @tracknstick/api db:query "SELECT COUNT(*) FROM habits"
```

The API develops against a local database built from the files in
`apps/api/migrations`. Create it once, and run this again after pulling new
migrations:

```bash
pnpm --filter @tracknstick/api db:migrate
```

How schema changes are written and reach production is described in
[apps/api/migrations/README.md](apps/api/migrations/README.md).

`pnpm dev:api` keeps the database local but still sends the chat feature's AI
calls to Cloudflare, so it needs `wrangler login`. To run with nothing remote,
use `pnpm --filter @tracknstick/api dev:local`; chat will not get answers in
that mode.

## License

[MIT](LICENSE)
