// Retry management and error categorization for sync operations
// Handles exponential backoff, error classification, and recovery strategies

import { SyncOperation } from '../types';

export enum ErrorCategory {
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  AUTH = 'AUTH',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN',
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterFactor: number;
}

export interface ErrorInfo {
  category: ErrorCategory;
  retryable: boolean;
  suggestedDelay?: number;
  recoveryStrategy?: string;
}

export class RetryManager {
  private config: RetryConfig;

  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
      ...config,
    };
  }

  categorizeError(error: Error | string): ErrorInfo {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorName = typeof error === 'string' ? '' : error.name;

    // Authentication errors (highest priority)
    if (this.isAuthError(errorMessage)) {
      return {
        category: ErrorCategory.AUTH,
        retryable: false,
        recoveryStrategy: 'Re-authenticate user and retry',
      };
    }

    // Rate limiting (specific HTTP error)
    if (this.isRateLimitError(errorMessage)) {
      return {
        category: ErrorCategory.RATE_LIMIT,
        retryable: true,
        suggestedDelay: this.config.maxDelay,
        recoveryStrategy: 'Rate limited - wait longer before retry',
      };
    }

    // Conflict errors (409)
    if (this.isConflictError(errorMessage)) {
      return {
        category: ErrorCategory.CONFLICT,
        retryable: false,
        recoveryStrategy: 'Data conflict - resolve manually',
      };
    }

    // Server errors (5xx) - check before network to avoid false positives
    if (this.isServerError(errorMessage)) {
      return {
        category: ErrorCategory.SERVER,
        retryable: true,
        suggestedDelay: this.config.baseDelay * 2,
        recoveryStrategy: 'Server issue - retry with exponential backoff',
      };
    }

    // Client errors (4xx except auth and conflict)
    if (this.isClientError(errorMessage)) {
      return {
        category: ErrorCategory.CLIENT,
        retryable: false,
        recoveryStrategy: 'Client error - check data validity',
      };
    }

    // Network-related errors (check last to avoid false positives)
    if (this.isNetworkError(errorMessage, errorName)) {
      return {
        category: ErrorCategory.NETWORK,
        retryable: true,
        suggestedDelay: this.config.baseDelay,
        recoveryStrategy: 'Check network connectivity and retry',
      };
    }

    // Unknown errors
    return {
      category: ErrorCategory.UNKNOWN,
      retryable: true,
      suggestedDelay: this.config.baseDelay,
      recoveryStrategy: 'Unknown error - retry with caution',
    };
  }

  shouldRetry(operation: SyncOperation, error: Error | string): boolean {
    const errorInfo = this.categorizeError(error);

    if (!errorInfo.retryable) {
      return false;
    }

    return operation.retryCount < operation.maxRetries;
  }

  calculateDelay(retryCount: number, errorInfo?: ErrorInfo): number {
    let delay = errorInfo?.suggestedDelay ?? this.config.baseDelay;

    // Apply exponential backoff
    delay *= Math.pow(this.config.backoffMultiplier, retryCount);

    // Cap at max delay
    delay = Math.min(delay, this.config.maxDelay);

    // Add jitter to prevent thundering herd
    const jitter = delay * this.config.jitterFactor * (Math.random() - 0.5);
    delay += jitter;

    return Math.max(delay, 0);
  }

  getRetryStrategy(
    operation: SyncOperation,
    error: Error | string,
  ): {
    shouldRetry: boolean;
    delay: number;
    category: ErrorCategory;
    recoveryStrategy?: string;
  } {
    const errorInfo = this.categorizeError(error);
    const shouldRetry = this.shouldRetry(operation, error);
    const delay = shouldRetry
      ? this.calculateDelay(operation.retryCount, errorInfo)
      : 0;

    return {
      shouldRetry,
      delay,
      category: errorInfo.category,
      recoveryStrategy: errorInfo.recoveryStrategy,
    };
  }

  // Error classification helpers
  private isNetworkError(message: string, name: string): boolean {
    const networkIndicators = [
      'network',
      'connection',
      'timeout',
      'fetch',
      'offline',
      'dns',
      'enotfound',
      'econnrefused',
      'etimedout',
    ];

    const networkNames = [
      'NetworkError',
      'TypeError', // Often thrown by fetch for network issues
    ];

    const lowerMessage = message.toLowerCase();

    return (
      networkIndicators.some((indicator) => lowerMessage.includes(indicator)) ||
      networkNames.includes(name)
    );
  }

  private isServerError(message: string): boolean {
    const serverIndicators = [
      '500',
      '502',
      '503',
      '504',
      'internal server error',
      'bad gateway',
      'service unavailable',
      'gateway timeout',
    ];

    return serverIndicators.some((indicator) =>
      message.toLowerCase().includes(indicator),
    );
  }

  private isAuthError(message: string): boolean {
    const authIndicators = [
      '401',
      '403',
      'unauthorized',
      'forbidden',
      'authentication',
      'token',
      'expired',
      'invalid credentials',
    ];

    return authIndicators.some((indicator) =>
      message.toLowerCase().includes(indicator),
    );
  }

  private isRateLimitError(message: string): boolean {
    const rateLimitIndicators = [
      '429',
      'rate limit',
      'too many requests',
      'throttle',
    ];

    return rateLimitIndicators.some((indicator) =>
      message.toLowerCase().includes(indicator),
    );
  }

  private isConflictError(message: string): boolean {
    const conflictIndicators = [
      '409',
      'conflict',
      'version mismatch',
      'concurrent modification',
    ];

    return conflictIndicators.some((indicator) =>
      message.toLowerCase().includes(indicator),
    );
  }

  private isClientError(message: string): boolean {
    const clientIndicators = [
      '400',
      '404',
      '422',
      'bad request',
      'not found',
      'unprocessable entity',
      'validation error',
    ];

    return clientIndicators.some((indicator) =>
      message.toLowerCase().includes(indicator),
    );
  }

  // Metrics and monitoring helpers
  getErrorMetrics(operations: SyncOperation[]): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    averageRetryCount: number;
    successRate: number;
  } {
    const failedOps = operations.filter(
      (op) => op.status === 'FAILED' || op.error,
    );
    const completedOps = operations.filter((op) => op.status === 'COMPLETED');

    const errorsByCategory: Record<ErrorCategory, number> = {
      [ErrorCategory.NETWORK]: 0,
      [ErrorCategory.SERVER]: 0,
      [ErrorCategory.CLIENT]: 0,
      [ErrorCategory.AUTH]: 0,
      [ErrorCategory.CONFLICT]: 0,
      [ErrorCategory.RATE_LIMIT]: 0,
      [ErrorCategory.UNKNOWN]: 0,
    };

    let totalRetryCount = 0;

    failedOps.forEach((op) => {
      if (op.error) {
        const errorInfo = this.categorizeError(op.error);
        errorsByCategory[errorInfo.category]++;
      }
      totalRetryCount += op.retryCount;
    });

    const totalOperations = operations.length;
    const successRate =
      totalOperations > 0 ? completedOps.length / totalOperations : 0;
    const averageRetryCount =
      failedOps.length > 0 ? totalRetryCount / failedOps.length : 0;

    return {
      totalErrors: failedOps.length,
      errorsByCategory,
      averageRetryCount,
      successRate,
    };
  }

  // Recovery suggestions
  suggestRecoveryAction(error: Error | string): string {
    const errorInfo = this.categorizeError(error);

    switch (errorInfo.category) {
      case ErrorCategory.NETWORK:
        return 'Check internet connection and try again';
      case ErrorCategory.SERVER:
        return 'Server is experiencing issues. Please try again later';
      case ErrorCategory.AUTH:
        return 'Please sign in again to continue';
      case ErrorCategory.RATE_LIMIT:
        return 'Too many requests. Please wait a moment before trying again';
      case ErrorCategory.CONFLICT:
        return 'Data has been modified elsewhere. Please refresh and try again';
      case ErrorCategory.CLIENT:
        return 'Please check your input and try again';
      default:
        return 'An unexpected error occurred. Please try again';
    }
  }
}
