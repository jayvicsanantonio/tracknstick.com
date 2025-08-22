// Comprehensive error handling system for offline operations
// Provides error categorization, recovery strategies, and user-friendly messages

export enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  CONFLICT = 'CONFLICT',
  DATABASE = 'DATABASE',
  SYNC = 'SYNC',
  AUTHENTICATION = 'AUTHENTICATION',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RecoveryStrategy {
  RETRY = 'RETRY',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION',
  IGNORE = 'IGNORE',
  OFFLINE_FALLBACK = 'OFFLINE_FALLBACK',
  USER_CHOICE = 'USER_CHOICE',
  AUTO_RESOLVE = 'AUTO_RESOLVE',
}

export interface ErrorContext {
  operation?: string;
  entity?: string;
  entityId?: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, unknown>;
}

export interface RecoveryAction {
  type: RecoveryStrategy;
  label: string;
  action: () => Promise<void> | void;
  primary?: boolean;
}

export class OfflineError extends Error {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly recoverable: boolean;
  public readonly userMessage: string;
  public readonly context: ErrorContext;
  public readonly originalError?: Error;
  public readonly recoveryActions: RecoveryAction[];

  constructor(
    code: string,
    message: string,
    userMessage: string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    recoverable = true,
    context: Partial<ErrorContext> = {},
    originalError?: Error,
    recoveryActions: RecoveryAction[] = [],
  ) {
    super(message);
    this.name = 'OfflineError';
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.recoverable = recoverable;
    this.userMessage = userMessage;
    this.originalError = originalError;
    this.recoveryActions = recoveryActions;
    this.context = {
      timestamp: new Date(),
      ...context,
    };

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OfflineError);
    }
  }

  /**
   * Create a network error
   */
  static network(
    message: string,
    context: Partial<ErrorContext> = {},
    originalError?: Error,
  ): OfflineError {
    return new OfflineError(
      'NETWORK_ERROR',
      message,
      'Unable to connect to the server. Your changes have been saved locally and will sync when connection is restored.',
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      true,
      context,
      originalError,
      [
        {
          type: RecoveryStrategy.RETRY,
          label: 'Retry',
          action: () => Promise.resolve(),
          primary: true,
        },
        {
          type: RecoveryStrategy.OFFLINE_FALLBACK,
          label: 'Continue Offline',
          action: () => Promise.resolve(),
        },
      ],
    );
  }

  /**
   * Create a validation error
   */
  static validation(
    message: string,
    userMessage: string,
    context: Partial<ErrorContext> = {},
    originalError?: Error,
  ): OfflineError {
    return new OfflineError(
      'VALIDATION_ERROR',
      message,
      userMessage,
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      false,
      context,
      originalError,
      [
        {
          type: RecoveryStrategy.MANUAL_INTERVENTION,
          label: 'Fix Input',
          action: () => Promise.resolve(),
          primary: true,
        },
      ],
    );
  }

  /**
   * Create a conflict error
   */
  static conflict(
    message: string,
    context: Partial<ErrorContext> = {},
    originalError?: Error,
    resolveAction?: () => Promise<void>,
  ): OfflineError {
    const actions: RecoveryAction[] = [
      {
        type: RecoveryStrategy.USER_CHOICE,
        label: 'Resolve Conflicts',
        action: resolveAction ?? (() => Promise.resolve()),
        primary: true,
      },
    ];

    return new OfflineError(
      'CONFLICT_ERROR',
      message,
      'Data conflicts detected. Please review and resolve conflicts to continue.',
      ErrorCategory.CONFLICT,
      ErrorSeverity.HIGH,
      true,
      context,
      originalError,
      actions,
    );
  }

  /**
   * Create a database error
   */
  static database(
    message: string,
    context: Partial<ErrorContext> = {},
    originalError?: Error,
  ): OfflineError {
    return new OfflineError(
      'DATABASE_ERROR',
      message,
      'Local storage error occurred. Please try again or clear your browser data if the problem persists.',
      ErrorCategory.DATABASE,
      ErrorSeverity.HIGH,
      true,
      context,
      originalError,
      [
        {
          type: RecoveryStrategy.RETRY,
          label: 'Try Again',
          action: () => Promise.resolve(),
          primary: true,
        },
      ],
    );
  }

  /**
   * Create a sync error
   */
  static sync(
    message: string,
    context: Partial<ErrorContext> = {},
    originalError?: Error,
    retryAction?: () => Promise<void>,
  ): OfflineError {
    const actions: RecoveryAction[] = [];

    if (retryAction) {
      actions.push({
        type: RecoveryStrategy.RETRY,
        label: 'Retry Sync',
        action: retryAction,
        primary: true,
      });
    }

    actions.push({
      type: RecoveryStrategy.OFFLINE_FALLBACK,
      label: 'Continue Offline',
      action: () => Promise.resolve(),
    });

    return new OfflineError(
      'SYNC_ERROR',
      message,
      'Synchronization failed. Your changes are saved locally and will sync when possible.',
      ErrorCategory.SYNC,
      ErrorSeverity.MEDIUM,
      true,
      context,
      originalError,
      actions,
    );
  }

  /**
   * Create an authentication error
   */
  static authentication(
    message: string,
    context: Partial<ErrorContext> = {},
    originalError?: Error,
  ): OfflineError {
    return new OfflineError(
      'AUTH_ERROR',
      message,
      'Authentication failed. Please sign in again to continue.',
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      false,
      context,
      originalError,
      [
        {
          type: RecoveryStrategy.MANUAL_INTERVENTION,
          label: 'Sign In',
          action: () => Promise.resolve(),
          primary: true,
        },
      ],
    );
  }

  /**
   * Create a generic error from unknown source
   */
  static fromUnknown(
    error: unknown,
    context: Partial<ErrorContext> = {},
  ): OfflineError {
    if (error instanceof OfflineError) {
      return error;
    }

    if (error instanceof Error) {
      // Try to categorize common error patterns
      const message = error.message.toLowerCase();

      if (
        message.includes('network') ||
        message.includes('fetch') ||
        message.includes('connection')
      ) {
        return OfflineError.network(error.message, context, error);
      }

      if (message.includes('validation') || message.includes('invalid')) {
        return OfflineError.validation(
          error.message,
          'Please check your input and try again.',
          context,
          error,
        );
      }

      if (message.includes('conflict') || message.includes('version')) {
        return OfflineError.conflict(error.message, context, error);
      }

      if (
        message.includes('database') ||
        message.includes('indexeddb') ||
        message.includes('storage')
      ) {
        return OfflineError.database(error.message, context, error);
      }

      if (
        message.includes('auth') ||
        message.includes('unauthorized') ||
        message.includes('forbidden')
      ) {
        return OfflineError.authentication(error.message, context, error);
      }
    }

    return new OfflineError(
      'UNKNOWN_ERROR',
      error instanceof Error ? error.message : String(error),
      'An unexpected error occurred. Please try again.',
      ErrorCategory.UNKNOWN,
      ErrorSeverity.MEDIUM,
      true,
      context,
      error instanceof Error ? error : undefined,
      [
        {
          type: RecoveryStrategy.RETRY,
          label: 'Try Again',
          action: () => Promise.resolve(),
          primary: true,
        },
      ],
    );
  }

  /**
   * Convert to JSON for logging/reporting
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      category: this.category,
      severity: this.severity,
      recoverable: this.recoverable,
      context: this.context,
      stack: this.stack,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
    };
  }

  /**
   * Check if error should be retried automatically
   */
  shouldAutoRetry(): boolean {
    return (
      this.recoverable &&
      (this.category === ErrorCategory.NETWORK ||
        this.category === ErrorCategory.SYNC) &&
      this.severity !== ErrorSeverity.CRITICAL
    );
  }

  /**
   * Check if error requires user intervention
   */
  requiresUserIntervention(): boolean {
    return (
      this.category === ErrorCategory.CONFLICT ||
      this.category === ErrorCategory.AUTHENTICATION ||
      this.severity === ErrorSeverity.CRITICAL ||
      !this.recoverable
    );
  }

  /**
   * Get primary recovery action
   */
  getPrimaryRecoveryAction(): RecoveryAction | undefined {
    return (
      this.recoveryActions.find((action) => action.primary) ??
      this.recoveryActions[0]
    );
  }
}
