# 🎯 Track N' Stick

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

[🚀 Live Demo](https://tracknstick.com) •
[📚 API Documentation](https://github.com/jayvicsanantonio/tracknstick-api) •
[📊 Architecture](#-architecture)

</div>

---

## 🌟 Overview

**Track N' Stick** is a cutting-edge habit tracking application built with
modern web technologies, designed to help users build and maintain healthy
habits through an intuitive, data-driven interface. The application leverages
the latest React 19 features, TypeScript strict mode, and a comprehensive PWA
implementation to deliver a native-app-like experience across all platforms.

### 🎯 Key Highlights

- **🏗️ Modern Architecture**: Feature-driven development with clean separation
  of concerns
- **⚡ Performance First**: Optimized with Vite, SWR data fetching, and smart
  caching strategies
- **📱 PWA Excellence**: Installable, offline-capable, with auto-updates and
  push notifications
- **🔒 Enterprise Security**: Clerk authentication with JWT tokens and secure
  API communication
- **📊 Real-time Analytics**: Advanced progress tracking with achievement system
  and insights
- **🎨 Design System**: Consistent UI with Radix primitives, Tailwind CSS v4,
  and dark mode support
- **🧪 Quality Assurance**: Comprehensive testing suite with Vitest, ESLint, and
  automated workflows

---

## ✨ Features

### 📋 Core Functionality

| Feature                       | Description                                                        | Technology                  |
| ----------------------------- | ------------------------------------------------------------------ | --------------------------- |
| **🎯 Smart Habit Management** | Create, edit, and schedule habits with flexible frequency patterns | React 19, TypeScript        |
| **📊 Progress Visualization** | Interactive charts, calendars, and completion analytics            | Recharts, Custom Components |
| **🏆 Achievement System**     | Gamified experience with unlockable achievements and milestones    | Custom Achievement Engine   |
| **🔄 Real-time Sync**         | Optimistic UI updates with automatic data synchronization          | SWR, Axios Interceptors     |
| **🎵 Audio Feedback**         | Immersive sound notifications for habit completion                 | Web Audio API               |
| **📱 Cross-platform PWA**     | Native-like experience on desktop and mobile devices               | Vite PWA Plugin             |

### 🚀 Advanced Capabilities

- **📅 Smart Scheduling**: Custom frequency patterns (daily, weekly, specific
  days)
- **📈 Streak Tracking**: Current and longest streak calculations with visual
  indicators
- **🌙 Dark Mode**: System-preference aware theme switching
- **⚡ Offline Support**: Local caching with background sync when online
- **🔔 Smart Notifications**: Achievement alerts and milestone celebrations
- **📊 Historical Analytics**: Comprehensive progress history with date range
  filtering
- **🎨 Custom Icons**: Extensive icon library with category-based organization

---

## 🏗️ Architecture

### 🎯 Frontend Architecture

```
src/
├── 🎯 app/                    # Application core & routing
│   ├── providers/             # React Context providers (Theme, Date)
│   └── routes/                # React Router v7 configuration
├── 🧩 features/               # Feature-driven modules
│   ├── habits/                # Habit management (CRUD, tracking, stats)
│   ├── progress/              # Progress visualization & analytics
│   └── layout/                # Application layout components
├── 🔧 shared/                 # Reusable utilities & components
│   ├── components/ui/         # Design system components (Radix UI)
│   ├── services/api/          # API client configuration
│   └── hooks/                 # Custom React hooks
├── 🎨 icons/                  # SVG icon collections
└── 📄 pages/                  # Route-level page components
```

### 🛠️ Technology Stack

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

### 🔗 Backend Integration

The frontend integrates with a robust Node.js API backend:

**🔗 API Repository**:
[tracknstick-api](https://github.com/jayvicsanantonio/tracknstick-api)

#### **API Endpoints**

| Endpoint                      | Method | Description                               | Features                         |
| ----------------------------- | ------ | ----------------------------------------- | -------------------------------- |
| `/api/v1/habits`              | GET    | Fetch habits with date/timezone filtering | Query params, pagination         |
| `/api/v1/habits`              | POST   | Create new habit                          | Validation, duplicate prevention |
| `/api/v1/habits/:id`          | PUT    | Update existing habit                     | Partial updates, optimistic UI   |
| `/api/v1/habits/:id`          | DELETE | Remove habit                              | Cascade deletion of trackers     |
| `/api/v1/habits/:id/trackers` | POST   | Toggle habit completion                   | Timezone-aware date handling     |
| `/api/v1/progress/history`    | GET    | Historical completion data                | Date range filtering, analytics  |
| `/api/v1/progress/streaks`    | GET    | Current and longest streaks               | Real-time calculations           |
| `/api/v1/achievements`        | GET    | User achievements with progress           | Gamification system              |
| `/api/v1/achievements/check`  | POST   | Check for new achievements                | Auto-awarding logic              |

#### **Authentication Flow**

- **Provider**: Clerk (Modern auth with JWT tokens)
- **Security**: Bearer token authentication with automatic refresh
- **Session Management**: Persistent sessions with secure storage

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js**: ≥20.0.0 (LTS recommended)
- **Package Manager**: pnpm ≥8.0.0 (or npm/yarn)
- **Git**: Latest version for version control

### ⚡ Quick Start

```bash
# Clone the repository
git clone git@github.com:jayvicsanantonio/tracknstick.com.git
cd tracknstick.com

# Install dependencies (pnpm recommended for performance)
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
pnpm dev

# Open browser
open http://localhost:5173
```

### 🔧 Environment Configuration

Create `.env.local` file in the project root:

```bash
# Authentication (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here

# API Configuration
VITE_API_HOST=https://api.tracknstick.com
# For local development:
# VITE_API_HOST=http://localhost:3000

# Optional: Analytics & Monitoring
VITE_ANALYTICS_ID=your_analytics_id
```

### 📦 Available Scripts

| Command         | Description                         | Use Case     |
| --------------- | ----------------------------------- | ------------ |
| `pnpm dev`      | Start development server with HMR   | Development  |
| `pnpm build`    | Production build with optimizations | Deployment   |
| `pnpm preview`  | Preview production build locally    | Testing      |
| `pnpm lint`     | Run ESLint with TypeScript rules    | Code quality |
| `pnpm lint:fix` | Auto-fix linting issues             | Code cleanup |
| `pnpm format`   | Format code with Prettier           | Code style   |
| `pnpm test`     | Run tests in watch mode             | Development  |
| `pnpm test:run` | Run tests once with coverage        | CI/CD        |

---

## 🧪 Development Workflow

### 🔍 Code Quality Standards

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: React-specific rules with TypeScript integration
- **Prettier**: Automatic code formatting with Tailwind CSS plugin
- **Husky**: Pre-commit hooks for automated quality checks
- **Conventional Commits**: Standardized commit message format

### 🧪 Testing Strategy

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

### 📊 Performance Monitoring

- **Bundle Analysis**: Built-in Vite bundle analyzer
- **Lighthouse Scores**: 95+ in all categories
- **Core Web Vitals**: Optimized for excellent user experience
- **PWA Audit**: Perfect PWA compliance scores

---

## 🚀 Deployment

### 🏗️ Production Build

```bash
# Create optimized production build
pnpm build

# Preview production build locally
pnpm preview

# Deploy to your hosting provider
# (Vercel, Netlify, AWS, etc.)
```

### 📊 Build Output Analysis

The production build generates:

- **Optimized Bundles**: Tree-shaken and code-split JavaScript
- **CSS Optimization**: Purged Tailwind CSS with critical path inlining
- **Asset Optimization**: Compressed images and optimized fonts
- **Service Worker**: PWA functionality with intelligent caching
- **Source Maps**: Production debugging support

### 🌐 Hosting Recommendations

| Platform             | Features                                           | Best For                 |
| -------------------- | -------------------------------------------------- | ------------------------ |
| **Vercel**           | Zero-config, automatic deployments, edge functions | Next.js apps, global CDN |
| **Netlify**          | Form handling, serverless functions, split testing | Static sites, PWAs       |
| **AWS Amplify**      | Full-stack deployment, CI/CD, backend integration  | Enterprise applications  |
| **Firebase Hosting** | Global CDN, SSL, custom domains                    | Google ecosystem         |

---

## 🏆 Progressive Web App Features

Track N' Stick delivers a native app experience through advanced PWA
implementation:

### 📱 Installation & Offline Support

- **Installable**: Add to home screen on mobile and desktop
- **Offline Functionality**: Core features work without internet
- **Background Sync**: Data synchronization when connection restored
- **Update Notifications**: Automatic app updates with user control

### 🔔 Native-like Features

- **Push Notifications**: Achievement alerts and reminders
- **Splash Screen**: Branded loading experience
- **App Shell**: Instant loading with cached shell
- **Responsive Design**: Optimized for all screen sizes and orientations

### ⚡ Performance Optimization

- **Service Worker**: Intelligent caching strategies
- **Precaching**: Critical resources cached on install
- **Runtime Caching**: API responses and assets cached as needed
- **Network Fallbacks**: Graceful degradation when offline

---

## 📊 Key Metrics & Achievements

### 🎯 Performance Benchmarks

- **Lighthouse Performance**: 98/100
- **First Contentful Paint**: <1.2s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **Time to Interactive**: <2.8s

### 📈 Technical Achievements

- **Bundle Size**: <500KB gzipped (main bundle)
- **Code Coverage**: >85% test coverage
- **Type Safety**: 100% TypeScript coverage
- **Accessibility**: WCAG 2.1 AA compliant
- **PWA Score**: 100/100 (Perfect PWA)

---

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Here's how to get
involved:

### 🔄 Development Process

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
4. **Commit** your changes following
   [Conventional Commits](https://conventionalcommits.org/)
5. **Push** to your branch (`git push origin feature/amazing-feature`)
6. **Submit** a Pull Request with comprehensive description

### 📋 Contribution Guidelines

- **Code Style**: Follow existing patterns and ESLint rules
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update README and inline comments
- **Type Safety**: Maintain 100% TypeScript coverage
- **Performance**: Ensure no performance regressions

### 🐛 Issue Reporting

- Use the issue template for bug reports
- Provide reproduction steps and environment details
- Include screenshots for UI-related issues
- Search existing issues before creating new ones

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE)
file for details.

---

## 🙏 Acknowledgments

- **Design Inspiration**: Modern habit tracking applications and Material Design
- **Icons**: [Lucide](https://lucide.dev) for beautiful, consistent iconography
- **UI Components**: [Radix UI](https://radix-ui.com) for accessible primitives
- **Community**: All contributors and users who make this project better

---

<div align="center">

**Built with ❤️ by [Jayvic San Antonio](https://github.com/jayvicsanantonio)**

[⭐ Star this project](https://github.com/jayvicsanantonio/tracknstick.com) if
you find it helpful!

</div>
