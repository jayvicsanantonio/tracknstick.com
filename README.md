# Track N' Stick

**Track N' Stick** is a Progressive Web Application designed to help you track
and build healthy habits. Built with a modern tech stack featuring React 19,
TypeScript, and Tailwind CSS v4, it provides an intuitive interface for managing
daily routines and achieving personal goals.

## ✨ Features

### Core Functionality

- **Habit Management:** Add, edit, delete, and track daily habits with custom
  icons and frequencies
- **Progress Visualization:** Interactive charts and calendars showing
  completion rates and historical data
- **Streak Tracking:** Monitor current and longest streaks to stay motivated
- **Flexible Scheduling:** Set habit frequency (daily, weekdays, weekends, or
  specific days)
- **Audio Feedback:** Sound notifications for habit completion and milestone
  achievements

### Progressive Web App

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

5. **Open your browser:**
   ```
   http://localhost:5173
   ```

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

For detailed API documentation, see
[API_DOCUMENTATION.md](API_DOCUMENTATION.md).

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

## Contributing

Contributions are welcome! If you find a bug or have a suggestion for
improvement, please open an issue or submit a pull request on the GitHub
repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for more information.
