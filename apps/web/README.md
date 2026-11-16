# Track N' Stick

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19.1.0-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![PWA](https://img.shields.io/badge/PWA-Ready-4285f4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developers.google.com/web/progressive-web-apps)
[![pnpm](https://img.shields.io/badge/pnpm-≥8.0.0-f69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io)

<img width="1667" height="1087" alt="Screenshot 2025-12-16 at 11 43 22 AM" src="https://github.com/user-attachments/assets/49d6a23f-9836-46da-83f7-3a80a4f4e9a1" />

**Build Better Habits, One Day at a Time**

_A modern, feature-rich Progressive Web Application for habit tracking with
real-time analytics, achievement system, and seamless user experience._

[ Live Demo](https://tracknstick.com) • [ API Documentation](../api/docs/api.md)
• [ Architecture](#-architecture)

</div>

---

## Overview

**Track N' Stick** is a cutting-edge habit tracking application built with
modern web technologies, designed to help users build and maintain healthy
habits through an intuitive, data-driven interface. The application leverages
the latest React 19 features, TypeScript strict mode, and a comprehensive PWA
implementation to deliver a native-app-like experience across all platforms.

### Key Highlights

- ** Modern Architecture**: Feature-driven development with clean separation of
  concerns
- ** Performance First**: Optimized with Vite, SWR data fetching, and smart
  caching strategies
- ** PWA Excellence**: Installable, offline-capable, with auto-updates and push
  notifications
- ** Enterprise Security**: Clerk authentication with JWT tokens and secure API
  communication
- ** Real-time Analytics**: Advanced progress tracking with achievement system
  and insights
- ** Design System**: Consistent UI with Radix primitives, Tailwind CSS v4, and
  dark mode support
- ** Quality Assurance**: Comprehensive testing suite with Vitest, ESLint, and
  automated workflows

---

## Features

### Core Functionality

| Feature                     | Description                                                        | Technology                  |
| --------------------------- | ------------------------------------------------------------------ | --------------------------- |
| ** Smart Habit Management** | Create, edit, and schedule habits with flexible frequency patterns | React 19, TypeScript        |
| ** Progress Visualization** | Interactive charts, calendars, and completion analytics            | Recharts, Custom Components |
| ** Achievement System**     | Gamified experience with unlockable achievements and milestones    | Custom Achievement Engine   |
| ** Real-time Sync**         | Optimistic UI updates with automatic data synchronization          | SWR, Axios Interceptors     |
| ** Audio Feedback**         | Immersive sound notifications for habit completion                 | Web Audio API               |
| ** Cross-platform PWA**     | Native-like experience on desktop and mobile devices               | Vite PWA Plugin             |

### Advanced Capabilities

- ** Smart Scheduling**: Custom frequency patterns (daily, weekly, specific
  days)
- ** Streak Tracking**: Current and longest streak calculations with visual
  indicators
- ** Dark Mode**: System-preference aware theme switching
- ** Offline Support**: Local caching with background sync when online
- ** Smart Notifications**: Achievement alerts and milestone celebrations
- ** Historical Analytics**: Comprehensive progress history with date range
  filtering
- ** Custom Icons**: Extensive icon library with category-based organization

---

## Architecture

### Frontend Architecture

```
src/
├──  app/                    # Application core & routing
│   ├── providers/             # React Context providers (Theme, Date)
│   └── routes/                # React Router v7 configuration
├──  features/               # Feature-driven modules
│   ├── habits/                # Habit management (CRUD, tracking, stats)
│   ├── progress/              # Progress visualization & analytics
│   └── layout/                # Application layout components
├──  shared/                 # Reusable utilities & components
│   ├── components/ui/         # Design system components (Radix UI)
│   ├── services/api/          # API client configuration
│   └── hooks/                 # Custom React hooks
├──  icons/                  # SVG icon collections
└──  pages/                  # Route-level page components
```

### Technology Stack

#### **Frontend Core**

- **Framework**: React 19.1.0 (Latest stable with concurrent features)
- **Language**: TypeScript 5.8+ (Strict mode enabled)
- **Build Tool**: Vite 6.3.5 (Ultra-fast HMR and optimized builds)
- **Package Manager**: pnpm (Fast, disk-efficient dependency management)
- **Node Version**: ≥20.0.0 (LTS support)

#### **UI & Styling**

- **CSS Framework**: Tailwind CSS v4 (Latest with native CSS features)
- **Component Library**: Radix UI (Accessible, unstyled primitives)
- **Design System**: shadcn/ui components with custom modifications
- **Animations**: Framer Motion (Smooth, performant animations)
- **Icons**: Lucide React (1000+ customizable icons)

#### **State Management & Data**

- **Server State**: SWR (Stale-while-revalidate with optimistic updates)
- **Client State**: React Context + useReducer patterns
- **HTTP Client**: Axios (Request/response interceptors for auth)
- **Form Handling**: Custom hooks with validation
- **Date Handling**: react-datepicker with timezone support

#### **Development & Quality**

- **Testing**: Vitest + React Testing Library (Fast, modern testing)
- **Linting**: ESLint 9+ (TypeScript-aware, React-specific rules)
- **Formatting**: Prettier (Consistent code style)
- **Git Hooks**: Husky + lint-staged (Automated quality checks)
- **Type Checking**: TypeScript strict mode with separate configs

#### **PWA & Performance**

- **PWA**: vite-plugin-pwa (Service worker, manifest, caching)
- **Caching**: Workbox strategies (Network-first, Cache-first)
- **Optimization**: Vite's built-in code splitting and tree shaking
- **Monitoring**: Performance API integration for metrics

### Backend Integration

The frontend calls the API in [`apps/api`](../api) (Hono on Cloudflare Workers)
at `VITE_API_HOST`, under `/api/v1`. Every endpoint, and the zod schema in
`packages/contracts` that defines its request and response, is listed in the
[API reference](../api/docs/api.md). The web app imports only the types from
that package.

#### **Authentication Flow**

- **Provider**: Clerk (Modern auth with JWT tokens)
- **Security**: Bearer token authentication with automatic refresh
- **Session Management**: Persistent sessions with secure storage

---

## Getting Started

### Prerequisites

- **Node.js**: 22 (see `.node-version`)
- **Package Manager**: pnpm, at the version `packageManager` in the root
  `package.json` pins
- **Git**: Latest version for version control

### Quick Start

```bash
# Clone the repository
git clone git@github.com:jayvicsanantonio/tracknstick.com.git
cd tracknstick.com

# Install dependencies for the whole workspace
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your configuration

# Start the development server
pnpm dev:web

# Open browser
open http://localhost:5173
```

### Environment Configuration

Create `apps/web/.env.local`:

```bash
# Authentication (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here

# API Configuration: the production API
VITE_API_HOST=https://tracknstick-api.hi-00e.workers.dev
# Or the local API (pnpm dev:api); then use the Clerk development key above
# VITE_API_HOST=http://localhost:3000
```

### Available Scripts

| Command              | Description                           | Use Case     |
| -------------------- | ------------------------------------- | ------------ |
| `pnpm dev`           | Start development server with HMR     | Development  |
| `pnpm build`         | Production build with optimizations   | Deployment   |
| `pnpm preview`       | Preview production build locally      | Testing      |
| `pnpm lint`          | Run ESLint with TypeScript rules      | Code quality |
| `pnpm lint:fix`      | Auto-fix linting issues               | Code cleanup |
| `pnpm format`        | Format code with Prettier             | Code style   |
| `pnpm test`          | Run tests in watch mode               | Development  |
| `pnpm test:run`      | Run tests once                        | CI/CD        |
| `pnpm test:coverage` | Run tests once with a coverage report | Code quality |

End-to-end tests run from the repository root with `pnpm test:e2e`; see
[`e2e/README.md`](e2e/README.md).

---

## Development Workflow

### Code Quality Standards

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: React-specific rules with TypeScript integration
- **Prettier**: Automatic code formatting with Tailwind CSS plugin
- **Husky**: Pre-commit hooks for automated quality checks
- **Commits**: Short imperative subjects ("Fix Welcome overflow")

### Testing Strategy

```bash
# Unit & Integration Tests
pnpm test                    # Watch mode for development
pnpm test:run               # Single run for CI/CD
pnpm test:coverage          # Coverage reports

# Linting & Formatting
pnpm lint                   # Check for issues
pnpm lint:fix              # Auto-fix issues
pnpm format                # Format all files
```

---

## Deployment

### Production Build

```bash
# Create optimized production build
pnpm build

# Preview production build locally
pnpm preview

```

Cloudflare Pages builds and deploys the web app from this repository on every
push; a branch gets a preview at `<branch>.tracknstick-com.pages.dev`. The build
command and the output directory `apps/web/dist` are set in the Cloudflare
dashboard. `public/_headers` sets the security headers and the
Content-Security-Policy that Pages sends with every page.

### Build Output Analysis

The production build generates:

- **Optimized Bundles**: Tree-shaken and code-split JavaScript
- **CSS Optimization**: Purged Tailwind CSS with critical path inlining
- **Asset Optimization**: Compressed images and optimized fonts
- **Service Worker**: PWA functionality with intelligent caching

---

## Progressive Web App Features

Track N' Stick delivers a native app experience through advanced PWA
implementation:

### Installation & Offline Support

- **Installable**: Add to home screen on mobile and desktop
- **Offline Shell**: The app shell and static assets are precached, so the app
  opens without a connection
- **Automatic Updates**: A new version installs itself in the background

### Native-like Features

- **Splash Screen**: Branded loading experience
- **App Shell**: Instant loading with cached shell
- **Responsive Design**: Optimized for all screen sizes and orientations

### Performance Optimization

- **Service Worker**: Intelligent caching strategies
- **Precaching**: Critical resources cached on install
- **Runtime Caching**: API responses are fetched fresh when online and served
  from a 24-hour cache when offline, emptied when the signed-in user changes
- **Network Fallbacks**: Graceful degradation when offline

---

## Contributing

We welcome contributions from developers of all skill levels! Here's how to get
involved:

### Development Process

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
4. **Commit** your changes with short imperative subjects
5. **Push** to your branch (`git push origin feature/amazing-feature`)
6. **Submit** a Pull Request with comprehensive description

### Contribution Guidelines

- **Code Style**: Follow existing patterns and ESLint rules
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update README and inline comments
- **Type Safety**: TypeScript strict mode, with no `any`
- **Performance**: Ensure no performance regressions

### Issue Reporting

- Use the issue template for bug reports
- Provide reproduction steps and environment details
- Include screenshots for UI-related issues
- Search existing issues before creating new ones

---

## License

This project is licensed under the **MIT License** - see the
[LICENSE](../../LICENSE) file for details.

---

## Acknowledgments

- **Design Inspiration**: Modern habit tracking applications and Material Design
- **Icons**: [Lucide](https://lucide.dev) for beautiful, consistent iconography
- **UI Components**: [Radix UI](https://radix-ui.com) for accessible primitives
- **Community**: All contributors and users who make this project better

---

<div align="center">

**Built with by [Jayvic San Antonio](https://github.com/jayvicsanantonio)**

[ Star this project](https://github.com/jayvicsanantonio/tracknstick.com) if you
find it helpful!

</div>
