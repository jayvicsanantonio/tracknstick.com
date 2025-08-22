// Unit tests for RetryManager class
// Tests error categorization, retry logic, exponential backoff, and recovery strategies

import { describe, it, expect, beforeEach } from 'vitest';
import { RetryManager, ErrorCategory } from '../RetryManager';
import { SyncOperation } from '../../types';

describe('RetryManager', () => {
  let retryManager: RetryManager;

  beforeEach(() => {
    retryManager = new RetryManager();
  });

  describe('error categorization', () => {
    it('should categorize network errors correctly', () => {
      const networkErrors = [
        'Network request failed',
        'Connection timeout',
        'DNS lookup failed',
        'ENOTFOUND',
        'ECONNREFUSED',
        'TypeError: Failed to fetch',
      ];

      networkErrors.forEach((error) => {
        const result = retryManager.categorizeError(error);
        expect(result.category).toBe(ErrorCategory.NETWORK);
        expect(result.retryable).toBe(true);
      });
    });

    it('should categorize server errors correctly', () => {
      const serverErrors = [
        'Internal Server Error (500)',
        'Bad Gateway (502)',
        'Service Unavailable (503)',
        'Gateway Timeout (504)',
      ];

      serverErrors.forEach((error) => {
        const result = retryManager.categorizeError(error);
        expect(result.category).toBe(ErrorCategory.SERVER);
        expect(result.retryable).toBe(true);
      });
    });

    it('should categorize authentication errors correctly', () => {
      const authErrors = [
        'Unauthorized (401)',
        'Forbidden (403)',
        'Invalid token',
        'Authentication failed',
        'Token expired',
      ];

      authErrors.forEach((error) => {
        const result = retryManager.categorizeError(error);
        expect(result.category).toBe(ErrorCategory.AUTH);
        expect(result.retryable).toBe(false);
      });
    });

    it('should categorize rate limit errors correctly', () => {
      const rateLimitErrors = [
        'Too Many Requests (429)',
        'Rate limit exceeded',
        'Request throttled',
      ];

      rateLimitErrors.forEach((error) => {
        const result = retryManager.categorizeError(error);
        expect(result.category).toBe(ErrorCategory.RATE_LIMIT);
        expect(result.retryable).toBe(true);
      });
    });

    it('should categorize conflict errors correctly', () => {
      const conflictErrors = [
        'Conflict (409)',
        'Version mismatch',
        'Concurrent modification detected',
      ];

      conflictErrors.forEach((error) => {
        const result = retryManager.categorizeError(error);
        expect(result.category).toBe(ErrorCategory.CONFLICT);
        expect(result.retryable).toBe(false);
      });
    });

    it('should categorize client errors correctly', () => {
      const clientErrors = [
        'Bad Request (400)',
        'Not Found (404)',
        'Unprocessable Entity (422)',
        'Validation error',
      ];

      clientErrors.forEach((error) => {
        const result = retryManager.categorizeError(error);
        expect(result.category).toBe(ErrorCategory.CLIENT);
        expect(result.retryable).toBe(false);
      });
    });

    it('should categorize unknown errors as retryable', () => {
      const unknownError = 'Something unexpected happened';
      const result = retryManager.categorizeError(unknownError);

      expect(result.category).toBe(ErrorCategory.UNKNOWN);
      expect(result.retryable).toBe(true);
    });

    it('should handle Error objects', () => {
      const networkError = new TypeError('Failed to fetch');
      const result = retryManager.categorizeError(networkError);

      expect(result.category).toBe(ErrorCategory.NETWORK);
      expect(result.retryable).toBe(true);
    });
  });

  describe('retry decision logic', () => {
    const createOperation = (
      retryCount: number,
      maxRetries: number = 3,
    ): SyncOperation => ({
      id: 'test-op',
      type: 'UPDATE',
      entity: 'HABIT',
      entityId: 'habit1',
      timestamp: new Date(),
      retryCount,
      maxRetries,
      status: 'FAILED',
    });

    it('should allow retry for retryable errors within limit', () => {
      const operation = createOperation(1, 3);
      const shouldRetry = retryManager.shouldRetry(operation, 'Network error');

      expect(shouldRetry).toBe(true);
    });

    it('should prevent retry when max retries reached', () => {
      const operation = createOperation(3, 3);
      const shouldRetry = retryManager.shouldRetry(operation, 'Network error');

      expect(shouldRetry).toBe(false);
    });

    it('should prevent retry for non-retryable errors', () => {
      const operation = createOperation(0, 3);
      const shouldRetry = retryManager.shouldRetry(
        operation,
        'Unauthorized (401)',
      );

      expect(shouldRetry).toBe(false);
    });
  });

  describe('delay calculation', () => {
    it('should calculate exponential backoff delays', () => {
      const baseDelay = 1000;
      const retryManager = new RetryManager({
        baseDelay,
        backoffMultiplier: 2,
      });

      const delay0 = retryManager.calculateDelay(0);
      const delay1 = retryManager.calculateDelay(1);
      const delay2 = retryManager.calculateDelay(2);

      // Account for jitter by checking ranges
      expect(delay0).toBeGreaterThanOrEqual(900);
      expect(delay0).toBeLessThanOrEqual(1100);

      expect(delay1).toBeGreaterThanOrEqual(1800);
      expect(delay1).toBeLessThanOrEqual(2200);

      expect(delay2).toBeGreaterThanOrEqual(3600);
      expect(delay2).toBeLessThanOrEqual(4400);
    });

    it('should respect maximum delay', () => {
      const retryManager = new RetryManager({
        baseDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 3,
      });

      const delay10 = retryManager.calculateDelay(10);
      expect(delay10).toBeLessThanOrEqual(5500); // Max + jitter tolerance
    });

    it('should use suggested delay from error info', () => {
      const errorInfo = {
        category: ErrorCategory.RATE_LIMIT,
        retryable: true,
        suggestedDelay: 10000,
      };

      const delay = retryManager.calculateDelay(0, errorInfo);
      expect(delay).toBeGreaterThanOrEqual(9000);
      expect(delay).toBeLessThanOrEqual(11000);
    });

    it('should never return negative delays', () => {
      const retryManager = new RetryManager({
        baseDelay: 100,
        jitterFactor: 2.0, // Large jitter that could go negative
      });

      for (let i = 0; i < 10; i++) {
        const delay = retryManager.calculateDelay(i);
        expect(delay).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('retry strategy', () => {
    const operation: SyncOperation = {
      id: 'test-op',
      type: 'CREATE',
      entity: 'HABIT',
      entityId: 'habit1',
      timestamp: new Date(),
      retryCount: 1,
      maxRetries: 3,
      status: 'FAILED',
    };

    it('should provide complete retry strategy for retryable errors', () => {
      const strategy = retryManager.getRetryStrategy(
        operation,
        'Network timeout',
      );

      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.delay).toBeGreaterThan(0);
      expect(strategy.category).toBe(ErrorCategory.NETWORK);
      expect(strategy.recoveryStrategy).toBeDefined();
    });

    it('should provide strategy for non-retryable errors', () => {
      const strategy = retryManager.getRetryStrategy(
        operation,
        'Unauthorized (401)',
      );

      expect(strategy.shouldRetry).toBe(false);
      expect(strategy.delay).toBe(0);
      expect(strategy.category).toBe(ErrorCategory.AUTH);
      expect(strategy.recoveryStrategy).toBeDefined();
    });
  });

  describe('error metrics', () => {
    const createOperations = (): SyncOperation[] => [
      {
        id: 'op1',
        type: 'CREATE',
        entity: 'HABIT',
        entityId: 'habit1',
        timestamp: new Date(),
        retryCount: 2,
        maxRetries: 3,
        status: 'FAILED',
        error: 'Network timeout',
      },
      {
        id: 'op2',
        type: 'UPDATE',
        entity: 'HABIT',
        entityId: 'habit2',
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'COMPLETED',
      },
      {
        id: 'op3',
        type: 'DELETE',
        entity: 'HABIT',
        entityId: 'habit3',
        timestamp: new Date(),
        retryCount: 3,
        maxRetries: 3,
        status: 'FAILED',
        error: 'Unauthorized (401)',
      },
      {
        id: 'op4',
        type: 'CREATE',
        entity: 'HABIT_ENTRY',
        entityId: 'entry1',
        timestamp: new Date(),
        retryCount: 1,
        maxRetries: 3,
        status: 'FAILED',
        error: 'Internal Server Error (500)',
      },
    ];

    it('should calculate error metrics correctly', () => {
      const operations = createOperations();
      const metrics = retryManager.getErrorMetrics(operations);

      expect(metrics.totalErrors).toBe(3);
      expect(metrics.errorsByCategory[ErrorCategory.NETWORK]).toBe(1);
      expect(metrics.errorsByCategory[ErrorCategory.AUTH]).toBe(1);
      expect(metrics.errorsByCategory[ErrorCategory.SERVER]).toBe(1);
      expect(metrics.successRate).toBe(0.25); // 1 successful out of 4
      expect(metrics.averageRetryCount).toBe(2); // (2 + 3 + 1) / 3
    });

    it('should handle empty operations list', () => {
      const metrics = retryManager.getErrorMetrics([]);

      expect(metrics.totalErrors).toBe(0);
      expect(metrics.successRate).toBe(0);
      expect(metrics.averageRetryCount).toBe(0);
    });
  });

  describe('recovery suggestions', () => {
    it('should provide appropriate recovery suggestions', () => {
      const suggestions = {
        'Network timeout':
          retryManager.suggestRecoveryAction('Network timeout'),
        'Unauthorized (401)':
          retryManager.suggestRecoveryAction('Unauthorized (401)'),
        'Internal Server Error (500)': retryManager.suggestRecoveryAction(
          'Internal Server Error (500)',
        ),
        'Too Many Requests (429)': retryManager.suggestRecoveryAction(
          'Too Many Requests (429)',
        ),
        'Conflict (409)': retryManager.suggestRecoveryAction('Conflict (409)'),
        'Bad Request (400)':
          retryManager.suggestRecoveryAction('Bad Request (400)'),
        'Unknown error': retryManager.suggestRecoveryAction('Unknown error'),
      };

      expect(suggestions['Network timeout']).toContain('connection');
      expect(suggestions['Unauthorized (401)']).toContain('sign in');
      expect(suggestions['Internal Server Error (500)']).toContain('Server');
      expect(suggestions['Too Many Requests (429)']).toContain('wait');
      expect(suggestions['Conflict (409)']).toContain('refresh');
      expect(suggestions['Bad Request (400)']).toContain('input');
      expect(suggestions['Unknown error']).toContain('unexpected');
    });
  });

  describe('custom configuration', () => {
    it('should use custom retry configuration', () => {
      const customConfig = {
        maxRetries: 5,
        baseDelay: 500,
        maxDelay: 10000,
        backoffMultiplier: 1.5,
        jitterFactor: 0.05,
      };

      const customRetryManager = new RetryManager(customConfig);

      const operation: SyncOperation = {
        id: 'test-op',
        type: 'UPDATE',
        entity: 'HABIT',
        entityId: 'habit1',
        timestamp: new Date(),
        retryCount: 4,
        maxRetries: 5,
        status: 'FAILED',
      };

      const shouldRetry = customRetryManager.shouldRetry(
        operation,
        'Network error',
      );
      expect(shouldRetry).toBe(true);

      const delay = customRetryManager.calculateDelay(0);
      expect(delay).toBeGreaterThanOrEqual(475); // 500 - 5% jitter
      expect(delay).toBeLessThanOrEqual(525); // 500 + 5% jitter
    });
  });

  describe('edge cases', () => {
    it('should handle very high retry counts', () => {
      const delay = retryManager.calculateDelay(100);
      expect(Number.isFinite(delay)).toBe(true);
      expect(delay).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty error messages', () => {
      const result = retryManager.categorizeError('');
      expect(result.category).toBe(ErrorCategory.UNKNOWN);
    });

    it('should handle null/undefined in operations', () => {
      const operations: SyncOperation[] = [
        {
          id: 'op1',
          type: 'CREATE',
          entity: 'HABIT',
          entityId: 'habit1',
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3,
          status: 'COMPLETED',
        },
      ];

      const metrics = retryManager.getErrorMetrics(operations);
      expect(metrics.totalErrors).toBe(0);
      expect(metrics.successRate).toBe(1);
    });
  });
});
