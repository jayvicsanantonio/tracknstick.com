import type { Ai, D1Database, RateLimit } from '@cloudflare/workers-types';

/** The Worker's bindings: wrangler.toml's vars and bindings, and its secrets. */
export interface Bindings {
  DB: D1Database;
  ENVIRONMENT: string;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  AI: Ai;
  PINECONE_API_KEY: string;
  CHAT_RATE_LIMITER: RateLimit;
}

/** The Hono environment shared by the app, its routes and their handlers. */
export interface AppEnv {
  Bindings: Bindings;
}

// Authentication context set by clerkMiddleware.
// Only the fields something reads live here: every consumer uses userId,
// and the error/security handlers use requestId for correlation.
export interface AuthContext {
  userId: string;
  requestId: string;
}

// Authentication context designed for performance with minimal data fetching
// Contains essential JWT claims and security metadata without additional API calls

// Extend Hono's context variable map for middleware use
declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
    // Read these through getValidated(), which types them by their schema.
    validated_json: unknown;
    validated_query: unknown;
    validated_param: unknown;
  }
}

export interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon?: string;
  type:
    | 'habit_creation'
    | 'streak'
    | 'completion'
    | 'special_achievement'
    | 'perfect_completion'
    | 'activity_tracking';
  category: 'getting_started' | 'consistency' | 'dedication' | 'milestones';
  requirementType: 'count' | 'streak' | 'days' | 'percentage';
  requirementValue: number;
  requirementData?: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievement {
  id: number;
  userId: string;
  achievementId: number;
  earnedAt: string;
  progressData?: string;
  achievement?: Achievement;
}
