// Error notification service for displaying user-friendly error messages
// Integrates with toast notifications and provides context-aware error messaging

import {
  OfflineError,
  ErrorCategory,
  ErrorSeverity,
  RecoveryAction,
  RecoveryStrategy,
} from './OfflineError';
import { getErrorReporting } from './ErrorReportingService';

export interface NotificationOptions {
  duration?: number;
  dismissible?: boolean;
  showRecoveryActions?: boolean;
  autoRetry?: boolean;
  retryDelay?: number;
}

export interface ErrorNotification {
  id: string;
  error: OfflineError;
  title: string;
  message: string;
  variant: 'default' | 'destructive' | 'warning';
  duration: number;
  dismissible: boolean;
  actions: NotificationAction[];
  timestamp: Date;
}

export interface NotificationAction {
  label: string;
  action: () => Promise<void> | void;
  primary?: boolean;
  variant?: 'default' | 'destructive' | 'outline';
}

export type NotificationHandler = (notification: ErrorNotification) => void;

export class ErrorNotificationService {
  private handlers = new Set<NotificationHandler>();
  private activeNotifications = new Map<string, ErrorNotification>();
  private defaultOptions: Required<NotificationOptions>;

  constructor() {
    this.defaultOptions = {
      duration: 5000,
      dismissible: true,
      showRecoveryActions: true,
      autoRetry: false,
      retryDelay: 3000,
    };
  }

  /**
   * Subscribe to error notifications
   */
  subscribe(handler: NotificationHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Display an error notification
   */
  async notifyError(
    error: OfflineError,
    options: NotificationOptions = {},
  ): Promise<void> {
    // Report the error
    await getErrorReporting().reportError(error);

    // Create notification
    const notification = this.createNotification(error, options);

    // Store active notification
    this.activeNotifications.set(notification.id, notification);

    // Notify all handlers
    this.handlers.forEach((handler) => {
      try {
        handler(notification);
      } catch (error) {
        console.error('Error notification handler failed:', error);
      }
    });

    // Handle auto-retry if enabled
    if (options.autoRetry && error.shouldAutoRetry()) {
      setTimeout(() => {
        void (async () => {
          try {
            const primaryAction = error.getPrimaryRecoveryAction();
            if (primaryAction) {
              await primaryAction.action();
              this.dismissNotification(notification.id);
            }
          } catch (retryError) {
            console.error('Auto-retry failed:', retryError);
          }
        })();
      }, options.retryDelay ?? this.defaultOptions.retryDelay);
    }

    // Auto-dismiss if configured
    if (notification.duration > 0) {
      setTimeout(() => {
        this.dismissNotification(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Dismiss a notification
   */
  dismissNotification(notificationId: string): void {
    this.activeNotifications.delete(notificationId);
  }

  /**
   * Dismiss all notifications
   */
  dismissAllNotifications(): void {
    this.activeNotifications.clear();
  }

  /**
   * Get active notifications
   */
  getActiveNotifications(): ErrorNotification[] {
    return Array.from(this.activeNotifications.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  private createNotification(
    error: OfflineError,
    options: NotificationOptions,
  ): ErrorNotification {
    const config = { ...this.defaultOptions, ...options };

    return {
      id: this.generateNotificationId(),
      error,
      title: this.getNotificationTitle(error),
      message: error.userMessage,
      variant: this.getNotificationVariant(error),
      duration: this.getNotificationDuration(error, config.duration),
      dismissible: config.dismissible,
      actions: config.showRecoveryActions
        ? this.createNotificationActions(error)
        : [],
      timestamp: new Date(),
    };
  }

  private getNotificationTitle(error: OfflineError): string {
    switch (error.category) {
      case ErrorCategory.NETWORK:
        return '🌐 Connection Issue';
      case ErrorCategory.VALIDATION:
        return '⚠️ Invalid Data';
      case ErrorCategory.CONFLICT:
        return '🔄 Data Conflict';
      case ErrorCategory.DATABASE:
        return '💾 Storage Error';
      case ErrorCategory.SYNC:
        return '🔄 Sync Issue';
      case ErrorCategory.AUTHENTICATION:
        return '🔐 Authentication Required';
      default:
        return '⚠️ Error';
    }
  }

  private getNotificationVariant(
    error: OfflineError,
  ): 'default' | 'destructive' | 'warning' {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        return 'default';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'destructive';
      default:
        return 'default';
    }
  }

  private getNotificationDuration(
    error: OfflineError,
    defaultDuration: number,
  ): number {
    // Critical errors and those requiring user intervention should persist longer
    if (
      error.severity === ErrorSeverity.CRITICAL ||
      error.requiresUserIntervention()
    ) {
      return 10000; // 10 seconds
    }

    // Network and sync errors can be shorter as they often resolve automatically
    if (
      error.category === ErrorCategory.NETWORK ||
      error.category === ErrorCategory.SYNC
    ) {
      return 3000; // 3 seconds
    }

    return defaultDuration;
  }

  private createNotificationActions(error: OfflineError): NotificationAction[] {
    return error.recoveryActions.map((action) => ({
      label: action.label,
      action: async () => {
        try {
          await action.action();
        } catch (actionError) {
          // Handle recovery action failure
          console.error(
            `Recovery action "${action.label}" failed:`,
            actionError,
          );

          // Create new error for the failed recovery action
          const recoveryError = OfflineError.fromUnknown(actionError, {
            operation: 'recovery_action',
            additionalData: {
              originalError: error.code,
              recoveryAction: action.type,
            },
          });

          await this.notifyError(recoveryError);
        }
      },
      primary: action.primary,
      variant: this.getActionVariant(action),
    }));
  }

  private getActionVariant(
    action: RecoveryAction,
  ): 'default' | 'destructive' | 'outline' {
    switch (action.type) {
      case RecoveryStrategy.RETRY:
        return 'default';
      case RecoveryStrategy.MANUAL_INTERVENTION:
      case RecoveryStrategy.USER_CHOICE:
        return 'outline';
      default:
        return 'outline';
    }
  }

  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global notification service instance
let globalNotificationService: ErrorNotificationService | null = null;

/**
 * Get or create the global error notification service
 */
export function getErrorNotification(): ErrorNotificationService {
  globalNotificationService ??= new ErrorNotificationService();
  return globalNotificationService;
}

/**
 * Notify about an error using the global service
 */
export async function notifyError(
  error: OfflineError,
  options?: NotificationOptions,
): Promise<void> {
  const service = getErrorNotification();
  await service.notifyError(error, options);
}

/**
 * Hook for React components to integrate with error notifications
 */
export function useErrorNotifications(
  toastFunction?: (
    notification: Pick<
      ErrorNotification,
      'title' | 'message' | 'variant' | 'duration' | 'actions'
    >,
  ) => void,
) {
  const service = getErrorNotification();

  // Subscribe to notifications and convert to toast format
  if (toastFunction) {
    return service.subscribe((notification) => {
      toastFunction({
        title: notification.title,
        message: notification.message,
        variant: notification.variant,
        duration: notification.duration,
        actions: notification.actions,
      });
    });
  }

  return service.subscribe.bind(service);
}
