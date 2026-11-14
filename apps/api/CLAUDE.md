# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development
- `pnpm run dev` - Start development server with Wrangler against the local D1 database (includes build). The AI binding still calls Cloudflare, so this needs `wrangler login`
- `pnpm run dev:local` - Same, with nothing remote: no login or network needed, but the chat endpoint cannot reach the AI model
- `pnpm run dev:remote` - Runs on Cloudflare against the production database; avoid unless production data is needed
- `pnpm run build` - Compile TypeScript to JavaScript

### Database Operations
- `pnpm run db:migrate` - Apply pending migrations to the local database
- `pnpm run db:setup` - Same as `db:migrate`, for a first-time setup
- `pnpm run db:seed` - Populate the local database with sample data
- `pnpm run db:reset` - Delete the local database and rebuild it from the migrations
- `pnpm run db:query` - Run a SQL query against the local database
- `pnpm run db:migrate:remote` and `pnpm run db:query:remote` target the production database; `db:reset` and `db:seed` refuse to
- Schema changes are new numbered files in `migrations/`, applied to production by the deploy workflow. See `migrations/README.md`

### Testing
- `pnpm run test` - Run all tests with Vitest
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:coverage` - Generate test coverage report
- Tests use Miniflare environment to simulate Cloudflare Workers runtime

### Code Quality
- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Auto-fix ESLint issues
- `pnpm run format` - Format code with Prettier

### Deployment
- `pnpm run deploy` - Deploy to Cloudflare Workers (includes build)

## Architecture Overview

This is a **Cloudflare Workers API** built with **Hono.js** for a habit tracking application. The architecture follows a layered approach:

### Core Technology Stack
- **Runtime**: Cloudflare Workers (serverless edge computing)
- **Framework**: Hono.js (fast web framework for edge)
- **Database**: Cloudflare D1 (serverless SQLite)
- **Authentication**: Clerk (JWT-based auth with middleware validation)
- **Validation**: Zod schemas with Hono middleware
- **Testing**: Vitest with Miniflare for Workers simulation

### Application Layers
```
Routes → Controllers → Services → Repositories → Database
```

- **Routes** (`src/routes/`): Define API endpoints and apply validation middleware
- **Controllers** (`src/controllers/`): Handle HTTP requests/responses, extract data from context
- **Services** (`src/services/`): Business logic, orchestrate repository calls
- **Repositories** (`src/repositories/`): Data access layer, direct database operations
- **Middlewares** (`src/middlewares/`): Request processing (auth, validation, logging, error handling)

### Key Architectural Patterns
- **Repository Pattern**: Database operations are abstracted into repository classes
- **Middleware Chain**: Clerk auth → request validation → controllers → error handling
- **Timezone-Aware**: All date operations consider user timezone with DST handling
- **Soft Deletes**: Habits and trackers use `deleted_at` timestamps instead of hard deletion

## Database Schema

### Core Tables
- **users**: Store Clerk user IDs and metadata
- **habits**: User habits with frequency patterns, streaks, and completion counters
- **trackers**: Individual habit completions with timestamps and notes
- **achievements**: Predefined achievement definitions
- **user_achievements**: Junction table tracking earned achievements

### Important Database Notes
- Uses Cloudflare D1 (serverless SQLite)
- Foreign keys reference `users.clerk_user_id` (string) not integer IDs
- Habits frequency stored as comma-separated days (e.g., "Mon,Wed,Fri")
- Timestamps stored as ISO strings for timezone calculation
- Comprehensive indexing on user_id, timestamps, and lookup fields

## Request/Response Patterns

### Authentication
All API routes require valid Clerk JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Validation Middleware
Uses `@hono/zod-validator` with custom `validateRequest` middleware:
```typescript
validateRequest(schema, 'json' | 'query' | 'param')
```

### Response Format
Consistent response structure with data and meta information:
```json
{
  "data": { /* response payload */ },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z",
    "timezone": "America/New_York"
  }
}
```

## Development Guidelines

### Code Organization
- Follow the established layered architecture
- Keep controllers thin - delegate business logic to services
- Use repositories for all database operations
- Place validation schemas in dedicated validator files
- Maintain timezone utilities in `utils/dateUtils.ts` and `utils/streakUtils.ts`

### Testing Approach
- **Unit Tests**: Test individual functions (utils, repositories, services)
- **Integration Tests**: Test API endpoints with mocked D1 database
- **Test Setup**: Use `src/tests/setup.ts` for common test utilities
- **Mocking**: Vitest mocks with Miniflare for Workers environment simulation

### Important Implementation Details
- **Timezone Handling**: All date calculations must consider user timezone using `getLocaleStartEnd()` utility
- **Streak Calculations**: Different logic for daily vs non-daily habits in `streakUtils.ts`
- **Soft Deletes**: Never hard delete habits/trackers - use `deleted_at` timestamp
- **Error Handling**: Use custom error classes from `utils/errors.ts` with proper HTTP status codes
- **Logging**: Structured logging with `utils/logger.ts` for debugging and monitoring

### Key Files to Reference
- `src/index.ts` - Main application entry point with middleware setup
- `src/types/index.ts` - TypeScript type definitions
- `migrations/` - Versioned database schema; `0001_initial_schema.sql` is the baseline
- `wrangler.toml` - Cloudflare Workers configuration
- `.cursor/rules/standards.mdc` - Project coding standards and conventions