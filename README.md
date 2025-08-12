# Track N' Stick

<<<<<<< Updated upstream
**Track N' Stick** is a Progressive Web Application designed to help you track
and build healthy habits. Built with a modern tech stack featuring React 19,
TypeScript, and Tailwind CSS v4, it provides an intuitive interface for managing
daily routines and achieving personal goals.

## ✨ Features

### Core Functionality
=======
**Track N' Stick** is a habit tracking web application that helps users build and maintain healthy habits through an intuitive interface. Built with a modern tech stack and designed as a Progressive Web App, it provides a seamless experience for managing your daily routines and achieving your goals.

## Core Features

- **Habit Management**: Add, edit, delete, and track daily habits with custom icons and scheduling
- **Progress Visualization**: Charts and calendars showing completion rates, streaks, and historical data
- **Customizable Scheduling**: Set habit frequency (daily, weekly, custom patterns) with flexible date ranges
- **Audio Feedback**: Sound notifications for habit completion and milestone achievements
- **PWA Support**: Installable as a Progressive Web App with offline capabilities and auto-updates
- **Responsive Design**: Works seamlessly across desktop and mobile devices with dark mode support
- **User Authentication**: Secure user accounts with Clerk authentication
- **Real-time Sync**: Data synchronization across devices with optimistic UI updates
>>>>>>> Stashed changes

- **Habit Management:** Add, edit, delete, and track daily habits with custom
  icons and frequencies
- **Progress Visualization:** Interactive charts and calendars showing
  completion rates and historical data
- **Streak Tracking:** Monitor current and longest streaks to stay motivated
- **Flexible Scheduling:** Set habit frequency (daily, weekdays, weekends, or
  specific days)
- **Audio Feedback:** Sound notifications for habit completion and milestone
  achievements

<<<<<<< Updated upstream
### Progressive Web App
=======
### Core Technologies

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.x for fast development and optimized builds
- **Styling**: Tailwind CSS v4 with utility-first approach
- **Package Manager**: pnpm (fast, disk-efficient with improved dependency management)
- **Node Version**: >= 20.0.0

### Key Libraries & Dependencies

- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: React Context + SWR for server state
- **HTTP Client**: Axios for API requests
- **Authentication**: Clerk for user management
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React + custom icon sets
- **Date Handling**: react-datepicker
- **Styling Utilities**: clsx + tailwind-merge via `cn()` helper

### Development Tools

- **Linting**: ESLint with React/TypeScript rules
- **Formatting**: Prettier with lint-staged pre-commit hooks
- **Git Hooks**: Husky for automated code quality checks
- **PWA**: vite-plugin-pwa for Progressive Web App features

## Project Architecture

The application follows a feature-driven architecture with clear separation of concerns:

```
src/
├── features/           # Feature modules
│   ├── habits/        # Habit management (CRUD, tracking, stats)
│   ├── progress/      # Progress visualization and analytics
│   └── layout/        # App layout components
├── components/        # Shared/reusable components
│   └── ui/           # shadcn/ui component library
├── context/          # Global app contexts (Theme, Date)
├── hooks/            # Shared custom hooks
├── lib/              # Utility functions and helpers
├── icons/            # Icon definitions and collections
├── assets/           # Static assets (audio, images)
└── services/         # External service integrations
```

### Key User Flows

1. **Habit Creation**: Users add habits with custom icons, names, and frequency patterns
2. **Daily Tracking**: Check off completed habits with visual and audio feedback
3. **Progress Review**: View completion rates, streaks, and historical data through charts and calendars
4. **Goal Achievement**: Celebrate milestones with animations and sound effects
>>>>>>> Stashed changes

- **Installable:** Install as a native app on desktop and mobile devices
- **Offline Support:** Continue tracking habits even without internet connection
- **Auto-Updates:** Seamless updates with user-friendly prompts
- **Responsive Design:** Optimized experience across all screen sizes

### User Experience

- **Dark/Light Theme:** Automatic theme switching based on system preferences
- **Accessibility:** Full keyboard navigation and screen reader support
- **Animations:** Smooth transitions and celebratory effects for achievements
- **Timezone Support:** Accurate date calculations regardless of user location

## 🛠 Tech Stack

### Frontend Framework

- **React 19** with TypeScript for modern component development
- **Vite 6.x** for fast development and optimized builds
- **Tailwind CSS v4** with utility-first styling approach

### UI & Interactions

- **Radix UI** primitives with **shadcn/ui** components
- **Framer Motion** for smooth animations and transitions
- **Lucide React** for consistent iconography
- **Recharts** for data visualization

### State & Data Management

- **React Context** for global state management
- **SWR** for server state and API caching
- **Axios** for HTTP requests with interceptors

### Development Tools

- **pnpm** for fast, efficient package management
- **ESLint** with React/TypeScript rules
- **Prettier** with automated formatting
- **Husky** for Git hooks and code quality checks

### PWA Features

- **vite-plugin-pwa** for Progressive Web App capabilities
- **Workbox** for service worker and caching strategies

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** (recommended) or npm

### Installation

### Prerequisites

- Node.js >= 20.0.0
- pnpm (recommended) or npm

### Installation

1. **Clone the repository:**

   ```bash
   git clone git@github.com:jayvicsanantonio/tracknstick.com.git
   cd tracknstick.com
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server:**

   ```bash
   pnpm dev
   ```

<<<<<<< Updated upstream
5. **Open your browser:**
   ```
   http://localhost:5173
   ```
=======
5. **Access the application:**
   Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

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
>>>>>>> Stashed changes

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm lint             # Run ESLint
```

> **Note:** This project uses [pnpm](https://pnpm.io/) as package manager. See
> [PNPM_MIGRATION.md](PNPM_MIGRATION.md) for migration details.

## 📁 Project Structure

```
src/
├── features/           # Feature-based modules
│   ├── habits/        # Habit management
│   │   ├── api/       # API calls and data fetching
│   │   ├── components/ # Feature-specific components
│   │   ├── context/   # Feature state management
│   │   ├── hooks/     # Custom hooks
│   │   └── types/     # TypeScript interfaces
│   ├── progress/      # Progress tracking & visualization
│   └── layout/        # App layout components
├── components/        # Shared/reusable components
│   └── ui/           # shadcn/ui component library
├── context/          # Global app contexts
├── hooks/            # Shared custom hooks
├── lib/              # Utility functions
├── icons/            # Icon definitions
├── assets/           # Static assets (audio, images)
├── pages/            # Route-level page components
├── layouts/          # Layout components for routing
├── routes/           # Routing configuration
└── services/         # External service integrations
```

## 🔌 API Integration

The application integrates with a REST API for data persistence. Key endpoints
include:

### Habits API

- `GET /api/v1/habits` - Fetch user habits
- `POST /api/v1/habits` - Create new habit
- `PUT /api/v1/habits/:id` - Update habit
- `DELETE /api/v1/habits/:id` - Delete habit
- `POST /api/v1/habits/:id/toggle` - Toggle habit completion

### Progress API

- `GET /api/v1/progress/overview` - Get progress overview with streaks
- `GET /api/v1/progress/history` - Get historical completion data
- `GET /api/v1/progress/streaks` - Get current and longest streaks

All API requests include timezone support for accurate date calculations across
different user locations.

For detailed API documentation, see the
[TrackNStick API Documentation](https://github.com/jayvicsanantonio/tracknstick-api/blob/main/docs/API_DOCUMENTATION.md).

## 🎨 Theming & Customization

The app supports both light and dark themes with automatic system preference
detection:

- **CSS Variables:** Defined in `src/index.css` for consistent theming
- **Theme Context:** Global theme state management via React Context
- **Tailwind Integration:** Custom color palette integrated with Tailwind CSS
- **Component Variants:** UI components adapt automatically to theme changes

## 📱 Progressive Web App Features

Track N' Stick is a full-featured PWA with:

- **Installation:** Add to home screen on mobile/desktop
- **Offline Mode:** Continue using the app without internet
- **Background Sync:** Data syncs when connection is restored
- **Push Notifications:** (Coming soon) Habit reminders
- **Auto-Updates:** Seamless app updates with user prompts

For PWA implementation details, see
[PWA_IMPLEMENTATION.md](PWA_IMPLEMENTATION.md).

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# API Configuration (if using external API)
VITE_API_BASE_URL=your_api_base_url
```

### Build Configuration

- **Path Aliases**: `@/` maps to `src/` directory
- **PWA**: Auto-updating service worker with offline support
- **TypeScript**: Strict mode enabled with separate configs for app/node

## Progressive Web App (PWA)

Track N' Stick is built as a PWA with the following features:

- **Installable**: Can be installed on desktop and mobile devices
- **Offline Support**: Core functionality works without internet connection
- **Auto-Updates**: Automatically updates when new versions are available
- **Native Feel**: Behaves like a native app when installed

### PWA Features

- Service worker for caching and offline functionality
- Web app manifest for installation prompts
- Optimized caching strategies for API calls and static assets
- Custom offline page for better user experience

## Development

### Code Quality

The project enforces code quality through:

- **ESLint**: TypeScript-aware linting with React-specific rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for automated checks
- **TypeScript**: Strict type checking enabled

### Testing

```bash
# Run linting
pnpm lint

# Fix linting issues
pnpm lint --fix
```

### Architecture Patterns

- **Feature-Based Organization**: Related functionality grouped together
- **Component Composition**: Reusable UI components with clear interfaces
- **Custom Hooks**: Business logic encapsulated in reusable hooks
- **Context API**: Global state management for theme and date
- **SWR**: Server state management with caching and optimistic updates

## Deployment

### Production Build

```bash
# Create production build
pnpm build

# Preview production build locally
pnpm preview
```

### Build Output

The production build generates:

- Optimized JavaScript and CSS bundles
- Service worker for PWA functionality
- Static assets with proper caching headers
- Web app manifest for installation

## Browser Support

- Chrome/Chromium-based browsers (recommended for full PWA support)
- Firefox
- Safari
- Edge

## Contributing

<<<<<<< Updated upstream
Contributions are welcome! If you find a bug or have a suggestion for
improvement, please open an issue or submit a pull request on the GitHub
repository.
=======
We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow the existing code style** and architecture patterns
3. **Write meaningful commit messages** following conventional commits
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Submit a pull request** with a clear description

### Development Setup

1. Follow the installation steps above
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the project's coding standards
4. Commit your changes: `git commit -m 'feat: add new feature'`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Submit a pull request
>>>>>>> Stashed changes

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for more information.
