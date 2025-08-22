// Comprehensive tests for error handling scenarios in offline operations
// Tests error categorization, recovery strategies, reporting, and notification systems

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  OfflineError,
  ErrorCategory,
  ErrorSeverity,
  RecoveryStrategy,
} from '../OfflineError';
import {
  ErrorReportingService,
  getErrorReporting,
} from '../ErrorReportingService';
import {
  ErrorNotificationService,
  getErrorNotification,
} from '../ErrorNotificationService';

// Mock localStorage
const mockLocalStorage = {
  data: new Map<string, string>(),
  getItem: vi.fn((key: string) => mockLocalStorage.data.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) =>
    mockLocalStorage.data.set(key, value),
  ),
  removeItem: vi.fn((key: string) => mockLocalStorage.data.delete(key)),
  clear: vi.fn(() => mockLocalStorage.data.clear()),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock fetch for server reporting
global.fetch = vi.fn();

describe('OfflineError System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.data.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('OfflineError Creation and Classification', () => {
    it('should create network error with appropriate properties', () => {
      const error = OfflineError.network('Connection failed', {
        operation: 'sync',
        entityId: 'habit-1',
      });

      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.recoverable).toBe(true);
      expect(error.shouldAutoRetry()).toBe(true);
      expect(error.requiresUserIntervention()).toBe(false);
      expect(error.userMessage).toContain('Unable to connect to the server');
      expect(error.recoveryActions).toHaveLength(2);
    });

    it('should create validation error with non-recoverable status', () => {
      const error = OfflineError.validation(
        'Invalid habit data',
        'Please check your input',
        { entityId: 'habit-1' },
      );

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.LOW);
      expect(error.recoverable).toBe(false);
      expect(error.shouldAutoRetry()).toBe(false);
      expect(error.requiresUserIntervention()).toBe(true);
    });

    it('should create conflict error with user choice action', () => {
      const resolveAction = vi.fn();
      const error = OfflineError.conflict(
        'Data conflict detected',
        { entityId: 'habit-1' },
        undefined,
        resolveAction,
      );

      expect(error.code).toBe('CONFLICT_ERROR');
      expect(error.category).toBe(ErrorCategory.CONFLICT);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.requiresUserIntervention()).toBe(true);
      expect(error.recoveryActions[0].action).toBe(resolveAction);
    });

    it('should create database error with retry capability', () => {
      const error = OfflineError.database('IndexedDB transaction failed', {
        operation: 'put',
      });

      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.category).toBe(ErrorCategory.DATABASE);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.recoverable).toBe(true);
      expect(error.recoveryActions[0].type).toBe(RecoveryStrategy.RETRY);
    });

    it('should create authentication error requiring manual intervention', () => {
      const error = OfflineError.authentication('Token expired', {
        userId: 'user-1',
      });

      expect(error.code).toBe('AUTH_ERROR');
      expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.recoverable).toBe(false);
      expect(error.requiresUserIntervention()).toBe(true);
    });

    it('should categorize unknown errors correctly', () => {
      const networkError = new Error('fetch failed');
      const error = OfflineError.fromUnknown(networkError);

      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.originalError).toBe(networkError);
    });

    it('should serialize to JSON correctly', () => {
      const error = OfflineError.network('Connection failed', {
        operation: 'sync',
      });

      const json = error.toJSON();

      expect(json).toMatchObject({
        name: 'OfflineError',
        code: 'NETWORK_ERROR',
        message: 'Connection failed',
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
      });
      expect(json.context).toBeDefined();
      expect(json.context.timestamp).toBeDefined();
    });
  });

  describe('ErrorReportingService', () => {
    let reportingService: ErrorReportingService;

    beforeEach(() => {
      reportingService = new ErrorReportingService({
        enableConsoleLogging: false,
        enableServerReporting: false,
      });
    });

    it('should store and retrieve error reports', async () => {
      const error = OfflineError.network('Test error');
      await reportingService.reportError(error);

      const metrics = reportingService.getMetrics();
      expect(metrics.totalErrors).toBe(1);
      expect(metrics.errorsByCategory[ErrorCategory.NETWORK]).toBe(1);
      expect(metrics.recentErrors).toHaveLength(1);
      expect(metrics.recentErrors[0].error).toBe(error);
    });

    it('should filter errors by category', async () => {
      await reportingService.reportError(OfflineError.network('Network error'));
      await reportingService.reportError(
        OfflineError.validation('Validation error', 'Fix input'),
      );
      await reportingService.reportError(
        OfflineError.database('Database error'),
      );

      const networkErrors = reportingService.getErrorsByCategory(
        ErrorCategory.NETWORK,
      );
      const validationErrors = reportingService.getErrorsByCategory(
        ErrorCategory.VALIDATION,
      );

      expect(networkErrors).toHaveLength(1);
      expect(validationErrors).toHaveLength(1);
      expect(networkErrors[0].error.category).toBe(ErrorCategory.NETWORK);
    });

    it('should filter errors by severity', async () => {
      await reportingService.reportError(
        OfflineError.validation('Low severity', 'Fix input'),
      );
      await reportingService.reportError(
        OfflineError.database('High severity'),
      );

      const lowSeverityErrors = reportingService.getErrorsBySeverity(
        ErrorSeverity.LOW,
      );
      const highSeverityErrors = reportingService.getErrorsBySeverity(
        ErrorSeverity.HIGH,
      );

      expect(lowSeverityErrors).toHaveLength(1);
      expect(highSeverityErrors).toHaveLength(1);
    });

    it('should prune old errors when limit exceeded', async () => {
      const service = new ErrorReportingService({ maxStoredErrors: 2 });

      await service.reportError(OfflineError.network('Error 1'));
      await service.reportError(OfflineError.network('Error 2'));
      await service.reportError(OfflineError.network('Error 3'));

      const metrics = service.getMetrics();
      expect(metrics.totalErrors).toBe(2);
    });

    it('should persist and restore errors from localStorage', async () => {
      const error = OfflineError.network('Persistent error');
      await reportingService.reportError(error);

      // Create new service instance to test persistence
      const newService = new ErrorReportingService();
      const metrics = newService.getMetrics();

      expect(metrics.totalErrors).toBe(1);
      expect(metrics.recentErrors[0].error.code).toBe('NETWORK_ERROR');
    });

    it('should handle server reporting when enabled', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce(new Response(null, { status: 200 }));

      const service = new ErrorReportingService({
        enableServerReporting: true,
        serverEndpoint: '/api/errors',
        reportingThreshold: ErrorSeverity.LOW,
      });

      const error = OfflineError.database('Critical error');
      await service.reportError(error);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/errors',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Critical error'),
        }),
      );
    });

    it('should clear all errors when requested', async () => {
      await reportingService.reportError(OfflineError.network('Error 1'));
      await reportingService.reportError(OfflineError.database('Error 2'));

      reportingService.clearErrors();

      const metrics = reportingService.getMetrics();
      expect(metrics.totalErrors).toBe(0);
    });

    it('should export errors for analysis', async () => {
      const error1 = OfflineError.network('Network error');
      const error2 = OfflineError.database('Database error');

      await reportingService.reportError(error1);
      await reportingService.reportError(error2);

      const exported = reportingService.exportErrors();

      expect(exported).toHaveLength(2);
      expect(exported.map((e) => e.error.code)).toContain('DATABASE_ERROR');
      expect(exported.map((e) => e.error.code)).toContain('NETWORK_ERROR');
    });
  });

  describe('ErrorNotificationService', () => {
    let notificationService: ErrorNotificationService;
    let mockHandler: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      notificationService = new ErrorNotificationService();
      mockHandler = vi.fn();
      notificationService.subscribe(mockHandler);
    });

    it('should create and emit notifications for errors', async () => {
      const error = OfflineError.network('Connection failed');
      await notificationService.notifyError(error);

      expect(mockHandler).toHaveBeenCalledTimes(1);
      const notification = mockHandler.mock.calls[0][0];

      expect(notification.title).toBe('🌐 Connection Issue');
      expect(notification.message).toBe(error.userMessage);
      expect(notification.variant).toBe('warning');
      expect(notification.actions).toHaveLength(2); // Retry and Continue Offline
    });

    it('should determine notification variants based on severity', async () => {
      await notificationService.notifyError(
        OfflineError.validation('Low', 'Fix'),
      );
      await notificationService.notifyError(OfflineError.network('Medium'));
      await notificationService.notifyError(OfflineError.database('High'));

      const calls = mockHandler.mock.calls;
      expect(calls[0][0].variant).toBe('default'); // Low severity
      expect(calls[1][0].variant).toBe('warning'); // Medium severity
      expect(calls[2][0].variant).toBe('destructive'); // High severity
    });

    it('should set appropriate durations for different error types', async () => {
      const criticalError = new OfflineError(
        'CRITICAL_ERROR',
        'Critical failure',
        'System failure',
        ErrorCategory.DATABASE,
        ErrorSeverity.CRITICAL,
      );

      await notificationService.notifyError(criticalError);
      await notificationService.notifyError(
        OfflineError.network('Network issue'),
      );

      const calls = mockHandler.mock.calls;
      expect(calls[0][0].duration).toBe(10000); // Critical errors persist longer
      expect(calls[1][0].duration).toBe(3000); // Network errors shorter
    });

    it('should handle recovery action failures gracefully', async () => {
      const failingAction = vi
        .fn()
        .mockRejectedValue(new Error('Action failed'));
      const error = new OfflineError(
        'TEST_ERROR',
        'Test error',
        'User message',
        ErrorCategory.UNKNOWN,
        ErrorSeverity.MEDIUM,
        true,
        {},
        undefined,
        [
          {
            type: RecoveryStrategy.RETRY,
            label: 'Retry',
            action: failingAction,
            primary: true,
          },
        ],
      );

      await notificationService.notifyError(error);
      const notification = mockHandler.mock.calls[0][0];

      // Execute the recovery action
      await notification.actions[0].action();

      expect(failingAction).toHaveBeenCalled();
      // Should have emitted another notification for the failed action
      expect(mockHandler).toHaveBeenCalledTimes(2);
    });

    it('should manage active notifications', async () => {
      const error1 = OfflineError.network('Error 1');
      const error2 = OfflineError.database('Error 2');

      await notificationService.notifyError(error1);
      await notificationService.notifyError(error2);

      const active = notificationService.getActiveNotifications();
      expect(active).toHaveLength(2);
      expect(active.map((n) => n.error.message)).toContain('Error 1');
      expect(active.map((n) => n.error.message)).toContain('Error 2');

      // Dismiss one notification
      notificationService.dismissNotification(active[1].id);
      expect(notificationService.getActiveNotifications()).toHaveLength(1);

      // Dismiss all
      notificationService.dismissAllNotifications();
      expect(notificationService.getActiveNotifications()).toHaveLength(0);
    });

    it('should support unsubscribing from notifications', async () => {
      const unsubscribe = notificationService.subscribe(mockHandler);
      unsubscribe();

      await notificationService.notifyError(OfflineError.network('Test'));

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('Global Error Functions', () => {
    it('should provide global error reporting instance', async () => {
      const service1 = getErrorReporting();
      const service2 = getErrorReporting();

      expect(service1).toBe(service2); // Should be singleton

      // Test global reportError function
      const { reportError } = await import('../ErrorReportingService');
      const error = OfflineError.network('Global test');

      await reportError(error);
      const metrics = service1.getMetrics();
      expect(metrics.totalErrors).toBeGreaterThan(0);
    });

    it('should provide global error notification instance', async () => {
      const service1 = getErrorNotification();
      const service2 = getErrorNotification();

      expect(service1).toBe(service2); // Should be singleton

      // Test global notifyError function
      const { notifyError } = await import('../ErrorNotificationService');
      const mockHandler = vi.fn();
      service1.subscribe(mockHandler);

      const error = OfflineError.network('Global notification test');
      await notifyError(error);

      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete error lifecycle', async () => {
      const notificationHandler = vi.fn();
      const notificationService = getErrorNotification();
      notificationService.subscribe(notificationHandler);

      // Create an error and notify
      const error = OfflineError.sync('Sync operation failed', {
        operation: 'sync',
        entityId: 'habit-1',
      });

      await notificationService.notifyError(error, {
        showRecoveryActions: true,
        duration: 5000,
      });

      // Verify error was reported and notification emitted
      const reportingService = getErrorReporting();
      const metrics = reportingService.getMetrics();

      expect(metrics.totalErrors).toBeGreaterThan(0);
      expect(notificationHandler).toHaveBeenCalled();

      const notification = notificationHandler.mock.calls[0][0];
      expect(notification.title).toContain('Sync Issue');
      expect(notification.actions).toBeDefined();
    });

    it('should maintain error context across services', async () => {
      const error = OfflineError.conflict('Data conflict in habit sync', {
        operation: 'sync',
        entity: 'habit',
        entityId: 'habit-123',
        userId: 'user-456',
        sessionId: 'session-789',
      });

      // Report error
      const reportingService = getErrorReporting();
      await reportingService.reportError(error);

      // Verify context is preserved
      const reports = reportingService.exportErrors();
      const report = reports.find((r) => r.error.code === 'CONFLICT_ERROR');

      expect(report).toBeDefined();
      expect(report!.error.context.operation).toBe('sync');
      expect(report!.error.context.entityId).toBe('habit-123');
      expect(report!.userId).toBe('user-456');
      expect(report!.sessionId).toBe('session-789');
    });
  });
});
