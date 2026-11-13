# Tech Stack & Build System

## Core Technologies

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.x for fast development and optimized builds
- **Styling**: Tailwind CSS v4 with utility-first approach
- **Package Manager**: pnpm (fast, disk-efficient with improved dependency
  management)
- **Node Version**: >= 20.0.0

## Key Libraries & Dependencies

- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: React Context + SWR for server state
- **HTTP Client**: Axios for API requests
- **Authentication**: Clerk for user management
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React + custom icon sets
- **Date Handling**: react-datepicker
- **Styling Utilities**: clsx + tailwind-merge via `cn()` helper

## Development Tools

- **Linting**: ESLint with React/TypeScript rules
- **Formatting**: Prettier with lint-staged pre-commit hooks
- **Git Hooks**: Husky for automated code quality checks
- **PWA**: vite-plugin-pwa for Progressive Web App features

## Common Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production (TypeScript + Vite)
pnpm preview          # Preview production build
pnpm lint             # Run ESLint

# Package Management
pnpm install          # Install dependencies
pnpm add <package>    # Add new dependency
```

## Build Configuration

- **Path Aliases**: `@/` maps to `src/` directory
- **PWA**: Auto-updating service worker with offline support
- **TypeScript**: Strict mode enabled with separate configs for app/node
