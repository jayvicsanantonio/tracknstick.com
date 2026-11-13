# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this
repository.

Repository purpose: React + Vite PWA for Track N' Stick, a habit tracking web
app. Tooling: pnpm, TypeScript, Vitest, ESLint, Prettier, Tailwind CSS v4, Clerk
auth, SWR, Axios, Vite PWA.

Commands

- Install deps: pnpm install
- Start dev server: pnpm dev (Vite, default http://localhost:5173)
- Build: pnpm build (TypeScript project build + Vite production build)
- Preview production build: pnpm preview
- Lint: pnpm lint
- Lint and fix: pnpm lint:fix
- Format code: pnpm format
- Run tests (watch): pnpm test
- Run tests once: pnpm test:run
- Test UI: pnpm test:ui
- Coverage: pnpm test:coverage

Running a single test

- By file (watch): pnpm test src/**tests**/routing.test.tsx
- By file (single run): pnpm test:run src/**tests**/routing.test.tsx
- By test name filter (watch): pnpm test -t "navigates to habits page"
  - You can combine with a path: pnpm test
    src/shared/hooks/**tests**/useTheme.test.tsx -t "toggles theme"

Environment

- Create a .env.local at the project root. From README:
  - VITE_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
  - VITE_API_HOST=https://api.tracknstick.com (or http://localhost:3000 for
    local API)
- Node: >= 20.0.0. Package manager: pnpm (recommended).

High-level architecture and structure

- Application type: SPA built with React 19 + Vite 6, TypeScript strict.
- Routing: React Router v7. Central configuration in src/app/routes/index.tsx.
  Route-level page components in src/pages.
- Providers: src/app/providers sets cross-cutting context
  (ThemeContext/Provider, DateContext/Provider). App.tsx wires providers and
  routes.
- Feature-driven modules (big picture):
  - src/features/habits: CRUD, tracking, feature state/context, API wrapper,
    hooks, and types.
  - src/features/progress: analytics (history, streaks, achievements), charts,
    calendar, hooks, and types.
  - src/features/layout: layout components used by pages/router.
- Shared layer (reusable building blocks):
  - src/shared/components/ui: Radix-based UI primitives (shadcn-style) and
    variants.
  - src/shared/components/layouts: app-level layouts (e.g., RootLayout).
  - src/shared/services/api/axiosInstance.ts: Axios client configured with base
    URL from config and Clerk auth token attachment (Bearer) via request
    interceptor.
  - src/shared/hooks: cross-cutting React hooks (e.g., theme, toast, page
    title).
  - src/shared/utils and src/shared/constants: utility helpers and constants
    (date formatting, navigation helpers, theme helpers, etc.).
- Assets and icons: src/assets (audio, images), src/icons (collections grouped
  by domain, e.g., habits, miscellaneous).
- PWA & performance:
  - VitePWA configured in vite.config.ts with generateSW, autoUpdate, manifest,
    and Workbox runtime caching.
    - Fonts (fonts.googleapis.com): CacheFirst with long TTL.
    - API (https://api.tracknstick.com/api/...): NetworkFirst with a dedicated
      cache and 24h TTL.
    - navigateFallback set to index.html, with /api excluded from fallback.
  - Manual chunking (vite build) splits vendor, ui (Radix), charts (recharts),
    icons (lucide-react), and clerk for improved caching.
- State & data:
  - Server state via SWR; client state via React Context and local component
    state.
  - API base from VITE_API_HOST. Authentication via Clerk; axios interceptor
    attaches Clerk session token if available.

Testing setup (Vitest + RTL)

- Config: vitest.config.ts uses environment: jsdom, globals: true, setupFiles:
  ./src/testing/setup.ts.
- Setup file installs @testing-library/jest-dom matchers, cleans up after each
  test, and mocks browser APIs (matchMedia, ResizeObserver,
  IntersectionObserver).
- Tests live under src/**tests**/ and alongside units (e.g., hooks and utils
  tests).
- Useful utilities in src/testing (mocks.tsx, utils.tsx) and path aliases are
  recognized by Vitest.

Path aliases

- @/ → src/
- @app/ → src/app/
- @features/ → src/features/
- @shared/ → src/shared/
- @testing/ → src/testing/ (Defined in both vite.config.ts and tsconfig.json;
  prefer alias imports for internal modules.)

Backend integration

- Primary API: https://github.com/jayvicsanantonio/tracknstick-api (see README
  for endpoints and auth flow).
- Frontend axios instance (src/shared/services/api/axiosInstance.ts) reads
  VITE_API_HOST and attaches Clerk JWTs automatically when available.

Quality checks bundle (from CLAUDE.md)

- Before committing locally, a fast confidence pass:
  - pnpm lint:fix && pnpm test:run && pnpm build

Notes for future Warp sessions

- Prefer pnpm for all package operations.
- Use alias imports (@, @app, @features, @shared, @testing) to keep imports
  consistent with tooling.
- When debugging API issues during development, confirm VITE_API_HOST and Clerk
  publishable key in .env.local align with the target backend.
