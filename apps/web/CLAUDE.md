# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Development Commands

### Essential Commands

- `pnpm dev` - Start development server with hot reload (requires `.env` with
  `VITE_*` keys)
- `pnpm build` - Production build (TypeScript project references + Vite bundle)
- `pnpm preview` - Serve the latest build for smoke checks
- `pnpm test` - Run tests in watch mode (Vitest)
- `pnpm test:run` - Run tests once
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm lint` / `pnpm lint:fix` - Check or auto-fix ESLint issues
- `pnpm format` - Format with Prettier
- `pnpm knip` - Find unused exports/dependencies

### Run a single test file

```
pnpm vitest run src/path/to/file.test.tsx
```

### Required Environment Variables

- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk auth key
- `VITE_API_HOST` — Backend API base URL:
  `https://tracknstick-api.hi-00e.workers.dev` in production,
  `http://localhost:3000` for `pnpm dev:api`

Missing `VITE_API_HOST` throws at startup via `src/shared/utils/getConfig.ts`.

### Quality Checks Before Committing

1. `pnpm lint:fix`
2. `pnpm test:run`
3. `pnpm build`

## Architecture

### Module Layout

```
src/
├── app/                  # Bootstrap: providers, router config
│   ├── providers/        # DateProvider/useDate, ThemeProvider (React context)
│   └── routes/           # React Router v7 route definitions
├── features/             # Domain slices (self-contained)
│   ├── habits/           # Habit CRUD, toggling, state dialogs
│   ├── progress/         # Streaks, calendar, achievements, charts
│   ├── chat/             # AI chatbot (Atomic Habits RAG), floating widget
│   └── layout/           # App shell components
├── pages/                # Route-level views (thin wrappers over features)
├── shared/               # Cross-feature reusables
│   ├── components/       # feedback/, layouts/, ui/ (shadcn/ui + Radix)
│   ├── services/api/     # Axios instance with Clerk JWT interceptor
│   ├── hooks/            # useTheme, use-toast, use-toggle, usePageTitle
│   ├── utils/            # date/, getConfig, theme, frequencyLabel, utils
│   └── constants/        # Theme storage key and default mode
├── icons/                # Lucide icon maps (habits, miscellaneous)
├── styles/               # index.css: Tailwind v4 setup and both theme palettes
├── types/                # Global TypeScript types
└── testing/              # Test helpers: setup.ts, mocks.tsx, utils.tsx
```

### Path Aliases

- `@/` → `src/`
- `@app/` → `src/app/`
- `@features/` → `src/features/`
- `@shared/` → `src/shared/`
- `@testing/` → `src/testing/`

### Data Flow

Each feature module follows this pattern:

1. **API layer** (`features/*/api/`) — plain async functions using the shared
   `axiosInstance`
2. **SWR hooks** (`features/*/hooks/`) — wrap API calls with `useSWR` for
   caching and revalidation
3. **React Context** — `HabitsStateProvider` holds UI-only state (which dialog
   is open, the habit being edited); it does **not** hold server data
4. **Components** — consume SWR hooks for data and context for UI state

The `useHabits` hook in `features/habits/hooks/` is the canonical example: it
calls the habit API functions, does optimistic updates via `mutate`, and plays
audio feedback on toggle.

### Launch Splash

`index.html` draws the launch splash, `#splash`, outside the React root with its
own inline styles, so it paints before the app's stylesheet or script and React
never re-renders it. It is the app icon come to life in every theme: the icon's
emerald, the pink ring sweeping closed around the dial, the check, and the name.
Only an app opened from a phone or tablet's home screen shows it
(`display-mode: standalone` and `pointer: coarse`); a browser tab, or an app
installed on a desktop, keeps it hidden. Chromium cannot emulate the display
mode, so `e2e/splash.e2e.ts` launches it with Blink's `displayModeOverride`
setting. `RootLayout` calls `useHideSplash` to fade it out and remove it once
Clerk has answered or an offline session begins. The iOS launch images in
`public/splash` (and their links in `index.html`) and the manifest's
`background_color` draw the same emerald and dial, so the OS splash leads
straight into it; `pnpm icons` regenerates the images and links. The service
worker leaves the launch images out of its precache. `LoadingFallback`, shown
while a page's code loads, is the medallion again, small and in the theme's
brand colour.

### Theming

Both palettes are declared in `src/styles/index.css` (`:root` for light, `.dark`
for dark). `public/applyStoredTheme.js`, loaded from `index.html` after the
launch splash, applies the stored class before the app renders; `ThemeProvider`
only selects the mode and persists it. There is no JavaScript token map — adding
a colour means adding it to both CSS blocks.

### Security Headers

`public/_headers` sets the security headers and the Content-Security-Policy that
Cloudflare Pages sends with every page. The policy allows no inline script: put
script in a file. A new third-party host the app loads from or calls has to be
added to the policy, and to `src/__tests__/securityHeaders.test.ts`.

### Authentication

Clerk is used for auth. The Axios instance at
`shared/services/api/axiosInstance.ts` attaches a Bearer token by reading
`window.Clerk.session.getToken()` in a request interceptor. No token is stored
in React state.

### Routing

React Router v7 with a layout route at `/` (`RootLayout`). Pages: Dashboard
(`/`), Habits (`/habits`), Progress (`/progress`). The chat widget is a floating
component, not a route.

### AI Chat

The chat panel (`features/chat/components/ChatBox.tsx`) posts the conversation
to the API's `/api/v1/chat` endpoint with `fetch` and reads the streamed text
response itself. It is designed as a RAG chatbot grounded in "Atomic Habits"
content.

### PWA

Vite PWA plugin with Workbox (`generateSW`, `prompt`): a new version waits until
the user chooses Reload in the update toast that `src/main.tsx` shows. The build
is precached, the habit sounds included. Requests under `/api/` at the build's
`VITE_API_HOST` use NetworkFirst with a 3-second network timeout, in a cache
that `useClearApiCacheOnUserChange` empties when the signed-in user changes; a
build without `VITE_API_HOST` has no API cache. SW filename is `sw.js`.
`public/_headers` lets browsers keep `/assets/*` for a year and has them check
`sw.js` and `manifest.json` with the server on every load.

Offline, Clerk cannot load its script or the session, so its `SignedIn` shows
nothing. `useOfflineSession` is true while the device is offline, Clerk has not
loaded, and the API cache's recorded owner says a user was signed in last time.
Gate signed-in UI with `SignedInOrOffline` (`shared/components/layouts`) rather
than Clerk's `SignedIn`, and let data hooks fetch when `useOfflineSession` is
true: the requests go without a token and the service worker answers them from
its cache. `RootLayout` reloads the page when the connection returns, so Clerk
loads and takes over. Keep API request URLs stable across visits (the habits
request sends the day's midnight, not the current moment), or the cache never
matches them.

`useOfflineSession` is also true once Clerk gives up loading (its `status` is
`error`), which is how a connection that reports online but gets nowhere is
found out; `RootLayout` then also reloads when the app returns to the foreground
with a connection.

A habit completion whose request reaches no server is kept on the device by
`features/habits/api/pendingCompletions.ts` (localStorage, one change per user,
habit and day), shown over the fetched list by `useHabits`, and sent by
`useSendPendingCompletions` (mounted in `App`) once a signed-in user is online.
Each change names its outcome (`completed` on the tracker POST), so sending it
twice or late is safe.

## Testing

- **Framework**: Vitest + React Testing Library (jsdom environment)
- **Setup**: `src/testing/setup.ts` — extends `expect` with jest-dom matchers,
  mocks `window.matchMedia`, `ResizeObserver`, `IntersectionObserver`
- **Mocks**: `src/testing/mocks.tsx` — component and page stubs for the routing
  tests. Opt-in: import `'@testing/mocks'` in a test that wants them. It is
  deliberately _not_ applied globally, so a test can render the real component
  it is testing
- **Render helper**: `renderWithRouter()` from `src/testing/utils.tsx` wraps
  components with `ClerkProvider`, `HabitsStateProvider`, and a `MemoryRouter`
- **Test file location**: `__tests__/` directories beside the code being tested,
  named `*.test.tsx` or `*.spec.ts`
- **Queries**: find elements the way a user would, by role and accessible name
  (`getByRole('button', { name: … })`), rather than by id, class or position
- **End-to-end**: Playwright tests in `e2e/`, named `*.e2e.ts`, run the app
  against the local API signed in as a Clerk test user. See `e2e/README.md`

## Code Conventions

- Feature modules export public API through `index.ts` barrel files
- Import across folders through the path aliases (`@/`, `@features/`,
  `@shared/`, …) rather than deep relative paths
- Components use default exports; utilities and hooks use named exports
- Tailwind classes composed with `clsx` + `tailwind-merge` (`cn()` helper)
- Formatting: 2-space indent, single quotes (Prettier-enforced)
- Commits: short imperative subject ("Fix Welcome overflow"); Husky +
  lint-staged runs on pre-commit
