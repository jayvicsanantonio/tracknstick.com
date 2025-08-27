// Utility functions for offline data management system
// Provides common utilities for ID generation, data validation, and error handling

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length > 0;
}

export function isTempId(id: string): boolean {
  return id.startsWith('temp_');
}

export function createRetryDelay(retryCount: number, baseDelay = 1000): number {
  // Exponential backoff with jitter
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), 30000);
  const jitter = Math.random() * 0.1 * delay;
  return delay + jitter;
}

export function isOnlineCompatible(): boolean {
  return (
    'indexedDB' in window &&
    'navigator' in window &&
    'onLine' in navigator &&
    'fetch' in window
  );
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item: unknown) => deepClone(item)) as T;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}

export function compareTimestamps(a: Date, b: Date): number {
  return a.getTime() - b.getTime();
}

export function isNewerThan(timestamp1: Date, timestamp2: Date): boolean {
  return compareTimestamps(timestamp1, timestamp2) > 0;
}

export function sanitizeForStorage<T>(data: T): T {
  // Convert any Date objects to ISO strings for storage
  return JSON.parse(JSON.stringify(data)) as T;
}

export function restoreFromStorage<T>(data: T): T {
  // This would restore Date objects from ISO strings
  // Implementation depends on the specific data structure
  // Currently returns data as-is, to be implemented based on specific needs
  return JSON.parse(JSON.stringify(data)) as T;
}

export class OfflineError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable = true,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'OfflineError';
  }
}

export function createOfflineError(
  message: string,
  code: string,
  retryable = true,
  originalError?: Error,
): OfflineError {
  return new OfflineError(message, code, retryable, originalError);
}

export function isRetryableError(error: Error): boolean {
  if (error instanceof OfflineError) {
    return error.retryable;
  }

  // Network errors are typically retryable
  if (error.name === 'NetworkError' || error.name === 'TypeError') {
    return true;
  }

  // Server errors (5xx) are retryable, client errors (4xx) are not
  if (
    error.message.includes('500') ||
    error.message.includes('502') ||
    error.message.includes('503')
  ) {
    return true;
  }

  return false;
}
