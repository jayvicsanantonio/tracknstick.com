// Error logging and reporting service for offline operations
// Provides centralized error tracking, metrics collection, and optional reporting to external services

import {
  OfflineError,
  ErrorCategory,
  ErrorSeverity,
  ErrorContext,
  RecoveryAction,
} from './OfflineError';

export interface ErrorReport {
  id: string;
  error: OfflineError;
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  reportedToServer: boolean;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  recentErrors: ErrorReport[];
  lastReportTime?: Date;
}

export interface ErrorReportingOptions {
  maxStoredErrors?: number;
  enableConsoleLogging?: boolean;
  enableServerReporting?: boolean;
  serverEndpoint?: string;
  reportingThreshold?: ErrorSeverity;
  batchSize?: number;
}

export class ErrorReportingService {
  private errors = new Map<string, ErrorReport>();
  private options: Required<ErrorReportingOptions>;
  private reportingQueue: ErrorReport[] = [];
  private isReporting = false;

  constructor(options: ErrorReportingOptions = {}) {
    this.options = {
      maxStoredErrors: options.maxStoredErrors ?? 100,
      enableConsoleLogging: options.enableConsoleLogging ?? true,
      enableServerReporting: options.enableServerReporting ?? false,
      serverEndpoint: options.serverEndpoint ?? '/api/v1/errors',
      reportingThreshold: options.reportingThreshold ?? ErrorSeverity.MEDIUM,
      batchSize: options.batchSize ?? 10,
    };

    // Load persisted errors from localStorage
    this.loadPersistedErrors();
  }

  /**
   * Report an error to the service
   */
  async reportError(error: OfflineError): Promise<void> {
    const report: ErrorReport = {
      id: this.generateErrorId(),
      error,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: error.context.userId,
      sessionId: error.context.sessionId,
      reportedToServer: false,
    };

    // Store the error
    this.errors.set(report.id, report);
    this.pruneOldErrors();

    // Log to console if enabled
    if (this.options.enableConsoleLogging) {
      this.logToConsole(report);
    }

    // Persist to localStorage
    this.persistErrors();

    // Queue for server reporting if enabled and meets threshold
    if (this.shouldReportToServer(error)) {
      this.reportingQueue.push(report);
      await this.processReportingQueue();
    }
  }

  /**
   * Get error metrics and statistics
   */
  getMetrics(): ErrorMetrics {
    const reports = Array.from(this.errors.values());

    const errorsByCategory = {} as Record<ErrorCategory, number>;
    const errorsBySeverity = {} as Record<ErrorSeverity, number>;

    // Initialize counters
    Object.values(ErrorCategory).forEach((category) => {
      errorsByCategory[category] = 0;
    });
    Object.values(ErrorSeverity).forEach((severity) => {
      errorsBySeverity[severity] = 0;
    });

    // Count errors
    reports.forEach((report) => {
      errorsByCategory[report.error.category]++;
      errorsBySeverity[report.error.severity]++;
    });

    return {
      totalErrors: reports.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: reports
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10),
      lastReportTime:
        reports.length > 0
          ? new Date(Math.max(...reports.map((r) => r.timestamp.getTime())))
          : undefined,
    };
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): ErrorReport[] {
    return Array.from(this.errors.values())
      .filter((report) => report.error.category === category)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): ErrorReport[] {
    return Array.from(this.errors.values())
      .filter((report) => report.error.severity === severity)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clear all stored errors
   */
  clearErrors(): void {
    this.errors.clear();
    this.reportingQueue = [];
    this.persistErrors();
  }

  /**
   * Export errors for debugging or analysis
   */
  exportErrors(): ErrorReport[] {
    return Array.from(this.errors.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  /**
   * Get recent errors for display
   */
  getRecentErrors(limit = 5): ErrorReport[] {
    return Array.from(this.errors.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldReportToServer(error: OfflineError): boolean {
    if (!this.options.enableServerReporting) {
      return false;
    }

    const severityLevels = {
      [ErrorSeverity.LOW]: 1,
      [ErrorSeverity.MEDIUM]: 2,
      [ErrorSeverity.HIGH]: 3,
      [ErrorSeverity.CRITICAL]: 4,
    };

    return (
      severityLevels[error.severity] >=
      severityLevels[this.options.reportingThreshold]
    );
  }

  private logToConsole(report: ErrorReport): void {
    const { error } = report;
    const logLevel = this.getConsoleLogLevel(error.severity);

    console[logLevel](`[OfflineError ${error.code}]`, error.message, {
      category: error.category,
      severity: error.severity,
      context: error.context,
      userMessage: error.userMessage,
      originalError: error.originalError,
      timestamp: report.timestamp,
      id: report.id,
    });
  }

  private getConsoleLogLevel(
    severity: ErrorSeverity,
  ): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'log';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'log';
    }
  }

  private async processReportingQueue(): Promise<void> {
    if (this.isReporting || this.reportingQueue.length === 0) {
      return;
    }

    this.isReporting = true;

    try {
      while (this.reportingQueue.length > 0) {
        const batch = this.reportingQueue.splice(0, this.options.batchSize);
        await this.reportBatchToServer(batch);
      }
    } catch (error) {
      console.error('Failed to report errors to server:', error);
      // Put failed reports back in queue for retry
      this.reportingQueue.unshift(...this.reportingQueue);
    } finally {
      this.isReporting = false;
    }
  }

  private async reportBatchToServer(batch: ErrorReport[]): Promise<void> {
    if (!this.options.serverEndpoint) {
      return;
    }

    const payload = {
      errors: batch.map((report) => ({
        id: report.id,
        timestamp: report.timestamp.toISOString(),
        userAgent: report.userAgent,
        url: report.url,
        userId: report.userId,
        sessionId: report.sessionId,
        error: report.error.toJSON(),
      })),
    };

    try {
      const response = await fetch(this.options.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Mark errors as reported
        batch.forEach((report) => {
          const storedReport = this.errors.get(report.id);
          if (storedReport) {
            storedReport.reportedToServer = true;
          }
        });
        this.persistErrors();
      } else {
        throw new Error(`Server responded with status ${response.status}`);
      }
    } catch (error) {
      // Re-queue the batch for retry
      this.reportingQueue.unshift(...batch);
      throw error;
    }
  }

  private pruneOldErrors(): void {
    if (this.errors.size <= this.options.maxStoredErrors) {
      return;
    }

    const sortedErrors = Array.from(this.errors.entries()).sort(
      (a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime(),
    );

    const excessCount = this.errors.size - this.options.maxStoredErrors;
    for (let i = 0; i < excessCount; i++) {
      this.errors.delete(sortedErrors[i][0]);
    }
  }

  private persistErrors(): void {
    try {
      const serializedErrors = Array.from(this.errors.entries()).map(
        ([id, report]) => [
          id,
          {
            ...report,
            timestamp: report.timestamp.toISOString(),
            error: report.error.toJSON(),
          },
        ],
      );

      localStorage.setItem('offline_errors', JSON.stringify(serializedErrors));
    } catch (error) {
      console.warn('Failed to persist errors to localStorage:', error);
    }
  }

  private loadPersistedErrors(): void {
    try {
      const stored = localStorage.getItem('offline_errors');
      if (!stored) {
        return;
      }

      const serializedErrors = JSON.parse(stored) as [
        string,
        {
          id: string;
          timestamp: string;
          userAgent: string;
          url: string;
          userId?: string;
          sessionId: string;
          reportedToServer?: boolean;
          error: {
            code: string;
            message: string;
            userMessage?: string;
            category: ErrorCategory;
            severity: ErrorSeverity;
            recoverable: boolean;
            context?: Partial<ErrorContext>;
            originalError?: Error;
            recoveryActions?: RecoveryAction[];
          };
        },
      ][];
      serializedErrors.forEach(([id, serializedReport]) => {
        try {
          // Reconstruct the OfflineError from JSON
          const error = new OfflineError(
            serializedReport.error.code,
            serializedReport.error.message,
            serializedReport.error.userMessage ?? '',
            serializedReport.error.category,
            serializedReport.error.severity,
            serializedReport.error.recoverable,
            serializedReport.error.context,
            serializedReport.error.originalError,
            serializedReport.error.recoveryActions,
          );

          const report: ErrorReport = {
            id: serializedReport.id,
            timestamp: new Date(serializedReport.timestamp),
            error,
            userAgent: serializedReport.userAgent,
            url: serializedReport.url,
            userId: serializedReport.userId,
            sessionId: serializedReport.sessionId,
            reportedToServer: serializedReport.reportedToServer ?? false,
          };

          this.errors.set(id, report);
        } catch (error) {
          console.warn(`Failed to restore error report ${id}:`, error);
        }
      });
    } catch (error) {
      console.warn('Failed to load persisted errors:', error);
      // Clear corrupted data
      localStorage.removeItem('offline_errors');
    }
  }
}

// Global error reporting service instance
let globalErrorReporting: ErrorReportingService | null = null;

/**
 * Get or create the global error reporting service
 */
export function getErrorReporting(
  options?: ErrorReportingOptions,
): ErrorReportingService {
  globalErrorReporting ??= new ErrorReportingService(options);
  return globalErrorReporting;
}

/**
 * Report an error using the global service
 */
export async function reportError(error: OfflineError): Promise<void> {
  const service = getErrorReporting();
  await service.reportError(error);
}
