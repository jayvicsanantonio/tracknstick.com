/**
 * Logger utility for consistent logging throughout the application.
 * This replaces direct console.log usage and provides better control
 * over logging in different environments.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enabled: import.meta.env.MODE === 'development',
      level: 'info',
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return this.levels[level] >= this.levels[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    return `${timestamp} [${level.toUpperCase()}]${prefix} ${message}`;
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog('debug')) {
      const formatted = this.formatMessage('debug', message);
      if (data) {
        console.debug(formatted, data);
      } else {
        console.debug(formatted);
      }
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog('info')) {
      const formatted = this.formatMessage('info', message);
      if (data) {
        console.info(formatted, data);
      } else {
        console.info(formatted);
      }
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog('warn')) {
      const formatted = this.formatMessage('warn', message);
      if (data) {
        console.warn(formatted, data);
      } else {
        console.warn(formatted);
      }
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog('error')) {
      const formatted = this.formatMessage('error', message);
      if (error) {
        console.error(formatted, error);
      } else {
        console.error(formatted);
      }
    }
  }

  /**
   * Create a child logger with a specific prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix,
    });
  }
}

// Create default logger instance
const logger = new Logger();

// Export both the class and default instance
export { Logger, logger };

// Export convenience functions
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);

/**
 * Usage examples:
 *
 * import { logger } from '@/utils/logger';
 * logger.debug('Debug message', { data: 'value' });
 *
 * // Or use convenience functions
 * import { debug, info, error } from '@/utils/logger';
 * debug('Debug message');
 * info('Info message');
 * error('Error message', error);
 *
 * // Create a child logger for specific modules
 * const offlineLogger = logger.child('offline');
 * offlineLogger.info('Sync started');
 */
