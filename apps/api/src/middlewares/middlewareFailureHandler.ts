// Middleware failure handling system with security event logging
// Provides proper error propagation and security monitoring for middleware failures

import { Context, Next } from 'hono';
import {
  BaseError,
  UnauthorizedError,
  RateLimitError,
} from '../utils/errors.js';
import logger from '../utils/logger.js';
import type { AppEnv } from '../types/index.js';

export interface SecurityEvent {
  type:
    | 'middleware_failure'
    | 'auth_failure'
    | 'rate_limit_exceeded'
    | 'validation_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  details: Record<string, unknown>;
  requestId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  path: string;
  method: string;
  timestamp: string;
}

/**
 * Security event logger for middleware failures
 */
class SecurityEventLogger {
  private static instance: SecurityEventLogger;

  public static getInstance(): SecurityEventLogger {
    if (!SecurityEventLogger.instance) {
      SecurityEventLogger.instance = new SecurityEventLogger();
    }
    return SecurityEventLogger.instance;
  }

  /**
   * Log a security event with proper context
   */
  logEvent(
    context: Context<AppEnv>,
    event: Omit<
      SecurityEvent,
      'path' | 'method' | 'timestamp' | 'ipAddress' | 'userAgent'
    >
  ): void {
    const auth = context.get('auth');

    const securityEvent: SecurityEvent = {
      ...event,
      path: context.req.path,
      method: context.req.method,
      timestamp: new Date().toISOString(),
      ipAddress:
        context.req.header('CF-Connecting-IP') ||
        context.req.header('X-Forwarded-For') ||
        'unknown',
      userAgent: context.req.header('User-Agent') || 'unknown',
      requestId: auth?.requestId,
      userId: auth?.userId,
    };

    // Log with appropriate level based on severity
    switch (event.severity) {
      case 'critical':
        logger.error(`Security Event: ${event.type}`, undefined, {
          ...securityEvent,
        });
        break;
      case 'high':
        logger.error(`Security Event: ${event.type}`, undefined, {
          ...securityEvent,
        });
        break;
      case 'medium':
        logger.warn(`Security Event: ${event.type}`, { ...securityEvent });
        break;
      case 'low':
        logger.info(`Security Event: ${event.type}`, { ...securityEvent });
        break;
    }

    // In production, you might want to send these events to a SIEM or security monitoring system
    // Example: await sendToSecurityMonitoring(securityEvent);
  }

  /**
   * Log authentication failure
   */
  logAuthFailure(context: Context<AppEnv>, error: Error, source: string): void {
    this.logEvent(context, {
      type: 'auth_failure',
      severity: 'high',
      source,
      details: {
        error: error.message,
        errorType: error.constructor.name,
        authorizationHeader: context.req.header('Authorization')
          ? 'present'
          : 'missing',
      },
    });
  }

  /**
   * Log rate limiting event
   */
  logRateLimitExceeded(
    context: Context<AppEnv>,
    details: Record<string, unknown>
  ): void {
    this.logEvent(context, {
      type: 'rate_limit_exceeded',
      severity: 'medium',
      source: 'rate_limit_middleware',
      details,
    });
  }

  /**
   * Log validation failure
   */
  logValidationFailure(
    context: Context<AppEnv>,
    error: Error,
    source: string
  ): void {
    this.logEvent(context, {
      type: 'validation_failure',
      severity: 'low',
      source,
      details: {
        error: error.message,
        errorType: error.constructor.name,
      },
    });
  }

  /**
   * Log general middleware failure
   */
  logMiddlewareFailure(
    context: Context<AppEnv>,
    error: Error,
    source: string
  ): void {
    const severity = this.determineSeverity(error);

    this.logEvent(context, {
      type: 'middleware_failure',
      severity,
      source,
      details: {
        error: error.message,
        errorType: error.constructor.name,
        stack: error.stack,
      },
    });
  }

  /**
   * Determine severity based on error type
   */
  private determineSeverity(error: Error): SecurityEvent['severity'] {
    if (error instanceof UnauthorizedError) {
      return 'high';
    }
    if (error instanceof RateLimitError) {
      return 'medium';
    }
    if (error instanceof BaseError) {
      return error.statusCode >= 500 ? 'high' : 'medium';
    }
    return 'medium';
  }
}

/**
 * Middleware wrapper that provides failure handling and security logging
 */
export function withFailureHandling(
  middlewareName: string,
  middleware: (
    c: Context<AppEnv, string>,
    next: Next
  ) => Promise<void | Response>
): (c: Context<AppEnv, string>, next: Next) => Promise<void | Response> {
  const securityLogger = SecurityEventLogger.getInstance();

  return async (
    c: Context<AppEnv, string>,
    next: Next
  ): Promise<void | Response> => {
    try {
      return await middleware(c, next);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Log the middleware failure with security context
      securityLogger.logMiddlewareFailure(c, err, middlewareName);

      // Handle specific error types with appropriate logging
      if (err instanceof UnauthorizedError) {
        securityLogger.logAuthFailure(c, err, middlewareName);
      } else if (err instanceof RateLimitError) {
        securityLogger.logRateLimitExceeded(c, {
          middleware: middlewareName,
          error: err.message,
        });
      }

      // Ensure request is blocked on critical failures
      if (shouldBlockRequest(err)) {
        logger.warn(
          `Request blocked due to middleware failure: ${middlewareName}`,
          {
            path: c.req.path,
            method: c.req.method,
            error: err.message,
          }
        );
      }

      // Re-throw the error to maintain error handling chain
      throw err;
    }

    /**
     * Determine if request should be blocked based on error type
     */
    function shouldBlockRequest(error: Error): boolean {
      // Block requests on authentication failures
      if (error instanceof UnauthorizedError) {
        return true;
      }

      // Block requests on rate limit exceeded
      if (error instanceof RateLimitError) {
        return true;
      }

      // Block requests on critical base errors
      if (error instanceof BaseError && error.statusCode >= 500) {
        return true;
      }

      return false;
    }
  };
}

/**
 * Clerk middleware wrapped with failure handling
 */
export function withClerkFailureHandling(
  clerkMiddleware: (c: Context<AppEnv>, next: Next) => Promise<void | Response>
) {
  return withFailureHandling('clerk_auth', clerkMiddleware);
}

/**
 * Rate limit middleware wrapped with failure handling
 */
export function withRateLimitFailureHandling(
  rateLimitMiddleware: (
    c: Context<AppEnv>,
    next: Next
  ) => Promise<void | Response>
) {
  return withFailureHandling('rate_limit', rateLimitMiddleware);
}

/**
 * Get security event logger instance for direct use
 */
export const getSecurityLogger = (): SecurityEventLogger => {
  return SecurityEventLogger.getInstance();
};
