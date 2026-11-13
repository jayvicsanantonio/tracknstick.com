# Repository Guidelines

## Project Structure & Module Organization

Track N' Stick keeps a feature-first layout inside `src`. Use `src/app` for
bootstrapping providers and routing, `src/features/*` for domain slices, and
`src/ui`/`src/shared` for reusable primitives, services, and hooks. Route views
sit in `src/pages`; configs and theme tokens live in `src/config` and
`src/core`. Place static assets in `public/`, long-form docs in `docs/`, and
keep e2e or integration drafts under `tests/e2e` and `tests/integration`. Ensure
`VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_HOST` are defined before
bootstrapping.

## Build, Test, and Development Commands

- `pnpm install` – install dependencies (Node ≥20 required).
- `pnpm dev` – launch the Vite dev server with HMR; requires a local `.env` with
  core `VITE_*` keys.
- `pnpm build` – run TypeScript project references then emit the production
  bundle.
- `pnpm preview` – serve the latest build for smoke checks.
- `pnpm lint` / `pnpm lint:fix` – run ESLint with Prettier integration,
  optionally auto-fixing.
- `pnpm test`, `pnpm test:coverage`, `pnpm test:ui` – execute Vitest suites in
  watch, coverage, or interactive UI modes.

## Coding Style & Naming Conventions

TypeScript strict mode is required; prefer path aliases (`@app`, `@shared`,
`@/`) to deep relatives. Prettier controls formatting (2-space indent, single
quotes) and is enforced by ESLint. Name components with PascalCase, hooks
`useThing`, and utilities camelCase. Compose Tailwind classes with
`clsx`/`tailwind-merge`; keep design tokens in CSS variables. Colocate UI files
with their feature and expose barrels only when they clarify imports.

## Testing Guidelines

Vitest + Testing Library cover unit and integration layers. Keep `__tests__`
directories beside the feature and name files `*.test.tsx`/`*.spec.ts`. Prefer
user-focused queries (`screen.findByRole`) and await async flows. Share render
helpers from `src/testing`. Use `tests/e2e` for narrative scenarios, even as
TODOs. Run `pnpm test:coverage` before PRs and expand coverage for new
behaviours.

## Commit & Pull Request Guidelines

Commit subjects stay short, imperative, and descriptive of the behaviour change
("Fix Welcome overflow"). Squash noisy WIP commits. PRs need a concise summary,
linked issues, and screenshots or clips when UI shifts. Confirm `pnpm lint`,
`pnpm test`, and `pnpm build` locally, note any skips, and flag reviewers from
affected areas plus follow-up tasks.
