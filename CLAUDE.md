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
- `VITE_API_HOST` — Backend API base URL (e.g. `https://api.tracknstick.com`)

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
3. **React Context** — `HabitsStateProvider` holds UI-only state (dialog
   open/close, edit mode); it does **not** hold server data
4. **Components** — consume SWR hooks for data and context for UI state

The `useHabits` hook in `features/habits/hooks/` is the canonical example: it
calls the habit API functions, does optimistic updates via `mutate`, and plays
audio feedback on toggle.

### Theming

Both palettes are declared in `src/styles/index.css` (`:root` for light,
`.dark` for dark). `index.html` applies the stored class before first paint;
`ThemeProvider` only selects the mode and persists it. There is no
JavaScript token map — adding a colour means adding it to both CSS blocks.

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

The chat feature uses the Vercel AI SDK (`ai` / `@ai-sdk/react`) to stream
responses from a backend endpoint. It is designed as a RAG chatbot grounded in
"Atomic Habits" content.

### PWA

Vite PWA plugin with Workbox. API calls to `api.tracknstick.com` use
NetworkFirst caching; static assets use CacheFirst. SW filename is `sw.js`.

## Testing

- **Framework**: Vitest + React Testing Library (jsdom environment)
- **Setup**: `src/testing/setup.ts` — extends `expect` with jest-dom matchers,
  mocks `window.matchMedia`, `ResizeObserver`, `IntersectionObserver`
- **Mocks**: `src/testing/mocks.tsx` — component and page stubs for the
  routing tests. Opt-in: import `'@testing/mocks'` in a test that wants them.
  It is deliberately *not* applied globally, so a test can render the real
  component it is testing
- **Render helper**: `renderWithRouter()` from `src/testing/utils.tsx` wraps
  components with `ClerkProvider`, `HabitsStateProvider`, and a `MemoryRouter`
- **Test file location**: `__tests__/` directories beside the code being tested,
  named `*.test.tsx` or `*.spec.ts`

## Code Conventions

- Feature modules export public API through `index.ts` barrel files
- Components use default exports; utilities and hooks use named exports
- Tailwind classes composed with `clsx` + `tailwind-merge` (`cn()` helper)
- Formatting: 2-space indent, single quotes (Prettier-enforced)
- Commits: short imperative subject ("Fix Welcome overflow"); Husky +
  lint-staged runs on pre-commit
