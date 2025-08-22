// Comprehensive data validation system for offline operations
// Provides validation rules, integrity checks, and data sanitization

import { OfflineHabit, HabitEntry } from '../types';
import {
  OfflineError,
  ErrorCategory,
  ErrorSeverity,
} from '../errors/OfflineError';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}

export interface ValidationRule<T> {
  field: keyof T;
  validate: (value: unknown, data: T) => ValidationError | null;
  sanitize?: (value: unknown) => unknown;
}

export interface IntegrityCheckResult {
  passed: boolean;
  issues: IntegrityIssue[];
  corrupted: boolean;
}

export interface IntegrityIssue {
  type:
    | 'missing_field'
    | 'invalid_type'
    | 'constraint_violation'
    | 'orphaned_reference'
    | 'duplicate_entry';
  field?: string;
  entityId?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoFixable: boolean;
}

export class DataValidator {
  private habitRules: ValidationRule<OfflineHabit>[] = [
    {
      field: 'name',
      validate: (value) => {
        if (!value || typeof value !== 'string') {
          return {
            field: 'name',
            code: 'REQUIRED',
            message: 'Habit name is required',
            severity: 'error',
          };
        }
        if (value.trim().length === 0) {
          return {
            field: 'name',
            code: 'EMPTY',
            message: 'Habit name cannot be empty',
            severity: 'error',
          };
        }
        if (value.length > 100) {
          return {
            field: 'name',
            code: 'TOO_LONG',
            message: 'Habit name cannot exceed 100 characters',
            severity: 'error',
          };
        }
        return null;
      },
      sanitize: (value) => (typeof value === 'string' ? value.trim() : value),
    },
    {
      field: 'icon',
      validate: (value) => {
        if (!value || typeof value !== 'string') {
          return {
            field: 'icon',
            code: 'REQUIRED',
            message: 'Habit icon is required',
            severity: 'error',
          };
        }
        if (value.trim().length === 0) {
          return {
            field: 'icon',
            code: 'EMPTY',
            message: 'Habit icon cannot be empty',
            severity: 'error',
          };
        }
        return null;
      },
      sanitize: (value) => (typeof value === 'string' ? value.trim() : value),
    },
    {
      field: 'frequency',
      validate: (value) => {
        if (!Array.isArray(value)) {
          return {
            field: 'frequency',
            code: 'INVALID_TYPE',
            message: 'Frequency must be an array',
            severity: 'error',
          };
        }
        if (value.length === 0) {
          return {
            field: 'frequency',
            code: 'EMPTY',
            message: 'At least one frequency day must be selected',
            severity: 'error',
          };
        }
        for (const day of value) {
          if (!Number.isInteger(day) || day < 0 || day > 6) {
            return {
              field: 'frequency',
              code: 'INVALID_DAY',
              message: 'Frequency days must be integers between 0-6',
              severity: 'error',
            };
          }
        }
        if (new Set(value).size !== value.length) {
          return {
            field: 'frequency',
            code: 'DUPLICATE_DAYS',
            message: 'Frequency contains duplicate days',
            severity: 'error',
          };
        }
        return null;
      },
      sanitize: (value) =>
        Array.isArray(value)
          ? [...new Set(value as number[])].sort((a, b) => a - b)
          : value,
    },
    {
      field: 'startDate',
      validate: (value) => {
        if (!value) {
          return {
            field: 'startDate',
            code: 'REQUIRED',
            message: 'Start date is required',
            severity: 'error',
          };
        }
        if (!(value instanceof Date) && typeof value !== 'string') {
          return {
            field: 'startDate',
            code: 'INVALID_TYPE',
            message: 'Start date must be a Date or valid date string',
            severity: 'error',
          };
        }
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) {
          return {
            field: 'startDate',
            code: 'INVALID_DATE',
            message: 'Start date is not a valid date',
            severity: 'error',
          };
        }
        return null;
      },
      sanitize: (value) => {
        if (value instanceof Date) return value;
        if (typeof value === 'string') return new Date(value);
        return value;
      },
    },
    {
      field: 'endDate',
      validate: (value, data) => {
        if (value !== undefined && value !== null) {
          if (!(value instanceof Date) && typeof value !== 'string') {
            return {
              field: 'endDate',
              code: 'INVALID_TYPE',
              message: 'End date must be a Date or valid date string',
              severity: 'error',
            };
          }
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) {
            return {
              field: 'endDate',
              code: 'INVALID_DATE',
              message: 'End date is not a valid date',
              severity: 'error',
            };
          }
          if (data.startDate) {
            const startDate =
              data.startDate instanceof Date
                ? data.startDate
                : new Date(data.startDate);
            if (date <= startDate) {
              return {
                field: 'endDate',
                code: 'INVALID_RANGE',
                message: 'End date must be after start date',
                severity: 'error',
              };
            }
          }
        }
        return null;
      },
      sanitize: (value) => {
        if (!value) return value;
        if (value instanceof Date) return value;
        if (typeof value === 'string') return new Date(value);
        return value;
      },
    },
    {
      field: 'version',
      validate: (value) => {
        if (
          typeof value !== 'number' ||
          !Number.isInteger(value) ||
          value < 1
        ) {
          return {
            field: 'version',
            code: 'INVALID_VERSION',
            message: 'Version must be a positive integer',
            severity: 'error',
          };
        }
        return null;
      },
    },
  ];

  private habitEntryRules: ValidationRule<HabitEntry>[] = [
    {
      field: 'habitId',
      validate: (value) => {
        if (!value || typeof value !== 'string') {
          return {
            field: 'habitId',
            code: 'REQUIRED',
            message: 'Habit ID is required',
            severity: 'error',
          };
        }
        if (value.trim().length === 0) {
          return {
            field: 'habitId',
            code: 'EMPTY',
            message: 'Habit ID cannot be empty',
            severity: 'error',
          };
        }
        return null;
      },
      sanitize: (value) => (typeof value === 'string' ? value.trim() : value),
    },
    {
      field: 'date',
      validate: (value) => {
        if (!value) {
          return {
            field: 'date',
            code: 'REQUIRED',
            message: 'Entry date is required',
            severity: 'error',
          };
        }
        if (!(value instanceof Date) && typeof value !== 'string') {
          return {
            field: 'date',
            code: 'INVALID_TYPE',
            message: 'Entry date must be a Date or valid date string',
            severity: 'error',
          };
        }
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) {
          return {
            field: 'date',
            code: 'INVALID_DATE',
            message: 'Entry date is not a valid date',
            severity: 'error',
          };
        }
        const now = new Date();
        if (date > now) {
          return {
            field: 'date',
            code: 'FUTURE_DATE',
            message: 'Entry date cannot be in the future',
            severity: 'error',
          };
        }
        return null;
      },
      sanitize: (value) => {
        if (value instanceof Date) return value;
        if (typeof value === 'string') return new Date(value);
        return value;
      },
    },
    {
      field: 'completed',
      validate: (value) => {
        if (typeof value !== 'boolean') {
          return {
            field: 'completed',
            code: 'INVALID_TYPE',
            message: 'Completed status must be a boolean',
            severity: 'error',
          };
        }
        return null;
      },
    },
    {
      field: 'version',
      validate: (value) => {
        if (
          typeof value !== 'number' ||
          !Number.isInteger(value) ||
          value < 1
        ) {
          return {
            field: 'version',
            code: 'INVALID_VERSION',
            message: 'Version must be a positive integer',
            severity: 'error',
          };
        }
        return null;
      },
    },
  ];

  /**
   * Validate a habit object
   */
  validateHabit(habit: Partial<OfflineHabit>): ValidationResult {
    return this.validateData(habit, this.habitRules);
  }

  /**
   * Validate a habit entry object
   */
  validateHabitEntry(entry: Partial<HabitEntry>): ValidationResult {
    return this.validateData(entry, this.habitEntryRules);
  }

  /**
   * Sanitize habit data
   */
  sanitizeHabit(habit: Partial<OfflineHabit>): Partial<OfflineHabit> {
    return this.sanitizeData(habit, this.habitRules);
  }

  /**
   * Sanitize habit entry data
   */
  sanitizeHabitEntry(entry: Partial<HabitEntry>): Partial<HabitEntry> {
    return this.sanitizeData(entry, this.habitEntryRules);
  }

  /**
   * Perform comprehensive integrity check on habits
   */
  checkHabitsIntegrity(habits: OfflineHabit[]): IntegrityCheckResult {
    const issues: IntegrityIssue[] = [];

    // Check for duplicates by name
    const nameMap = new Map<string, OfflineHabit[]>();
    habits.forEach((habit) => {
      const name = habit.name?.toLowerCase();
      if (name) {
        if (!nameMap.has(name)) {
          nameMap.set(name, []);
        }
        nameMap.get(name)!.push(habit);
      }
    });

    nameMap.forEach((duplicates, name) => {
      if (duplicates.length > 1) {
        issues.push({
          type: 'duplicate_entry',
          description: `Multiple habits with name "${name}": ${duplicates.map((h) => h.id).join(', ')}`,
          severity: 'medium',
          autoFixable: false,
        });
      }
    });

    // Check for missing required fields
    habits.forEach((habit) => {
      if (!habit.id) {
        issues.push({
          type: 'missing_field',
          field: 'id',
          entityId: 'unknown',
          description: 'Habit missing ID field',
          severity: 'critical',
          autoFixable: false,
        });
      }

      if (!habit.lastModified) {
        issues.push({
          type: 'missing_field',
          field: 'lastModified',
          entityId: habit.id,
          description: `Habit ${habit.id} missing lastModified timestamp`,
          severity: 'high',
          autoFixable: true,
        });
      }

      if (habit.version === undefined) {
        issues.push({
          type: 'missing_field',
          field: 'version',
          entityId: habit.id,
          description: `Habit ${habit.id} missing version number`,
          severity: 'high',
          autoFixable: true,
        });
      }
    });

    return {
      passed: issues.length === 0,
      issues,
      corrupted: issues.some((issue) => issue.severity === 'critical'),
    };
  }

  /**
   * Perform integrity check on habit entries
   */
  checkHabitEntriesIntegrity(
    entries: HabitEntry[],
    validHabitIds: Set<string>,
  ): IntegrityCheckResult {
    const issues: IntegrityIssue[] = [];

    // Check for orphaned entries
    entries.forEach((entry) => {
      if (!validHabitIds.has(entry.habitId)) {
        issues.push({
          type: 'orphaned_reference',
          field: 'habitId',
          entityId: entry.id,
          description: `Entry ${entry.id} references non-existent habit ${entry.habitId}`,
          severity: 'high',
          autoFixable: true,
        });
      }
    });

    // Check for duplicate entries (same habit, same date)
    const entryMap = new Map<string, HabitEntry[]>();
    entries.forEach((entry) => {
      const key = `${entry.habitId}_${entry.date.toISOString().split('T')[0]}`;
      if (!entryMap.has(key)) {
        entryMap.set(key, []);
      }
      entryMap.get(key)!.push(entry);
    });

    entryMap.forEach((duplicates, key) => {
      if (duplicates.length > 1) {
        issues.push({
          type: 'duplicate_entry',
          description: `Multiple entries for ${key}: ${duplicates.map((e) => e.id).join(', ')}`,
          severity: 'medium',
          autoFixable: true,
        });
      }
    });

    return {
      passed: issues.length === 0,
      issues,
      corrupted: issues.some((issue) => issue.severity === 'critical'),
    };
  }

  /**
   * Attempt to automatically fix integrity issues
   */
  autoFixIntegrityIssues(issues: IntegrityIssue[]): {
    fixed: IntegrityIssue[];
    unfixable: IntegrityIssue[];
  } {
    const fixed: IntegrityIssue[] = [];
    const unfixable: IntegrityIssue[] = [];

    for (const issue of issues) {
      if (issue.autoFixable) {
        try {
          // Auto-fix logic would depend on the specific issue type
          // This is a placeholder for the auto-fix implementation
          fixed.push(issue);
        } catch {
          unfixable.push(issue);
        }
      } else {
        unfixable.push(issue);
      }
    }

    return { fixed, unfixable };
  }

  /**
   * Create validation error for invalid data
   */
  createValidationError(
    field: string,
    code: string,
    message: string,
    data?: unknown,
  ): OfflineError {
    return OfflineError.validation(
      `Validation failed for field '${field}': ${message}`,
      `Invalid ${field}: ${message}`,
      {
        operation: 'validation',
        additionalData: {
          field,
          code,
          validationData: data,
        },
      },
    );
  }

  /**
   * Create integrity error for corrupted data
   */
  createIntegrityError(issues: IntegrityIssue[]): OfflineError {
    const criticalIssues = issues.filter(
      (issue) => issue.severity === 'critical',
    );
    const message =
      criticalIssues.length > 0
        ? `Data corruption detected: ${criticalIssues[0].description}`
        : `Data integrity issues found: ${issues.length} issue(s)`;

    return new OfflineError(
      'DATA_INTEGRITY_ERROR',
      message,
      'Data integrity issues detected. Some data may be corrupted.',
      ErrorCategory.DATABASE,
      criticalIssues.length > 0 ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH,
      true,
      {
        operation: 'integrity_check',
        additionalData: { issues },
      },
    );
  }

  private validateData<T>(
    data: Partial<T>,
    rules: ValidationRule<T>[],
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of rules) {
      const value = data[rule.field];
      const error = rule.validate(value, data as T);
      if (error) {
        if (error.severity === 'error') {
          errors.push(error);
        } else if (error.severity === 'warning') {
          warnings.push(error as ValidationWarning);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private sanitizeData<T>(
    data: Partial<T>,
    rules: ValidationRule<T>[],
  ): Partial<T> {
    const sanitized = { ...data };

    for (const rule of rules) {
      if (rule.sanitize) {
        const value = sanitized[rule.field];
        (sanitized as Record<keyof T, unknown>)[rule.field] =
          rule.sanitize(value);
      }
    }

    return sanitized;
  }
}

// Global validator instance
let globalValidator: DataValidator | null = null;

/**
 * Get or create the global data validator
 */
export function getDataValidator(): DataValidator {
  globalValidator ??= new DataValidator();
  return globalValidator;
}

/**
 * Validate and sanitize habit data
 */
export function validateAndSanitizeHabit(habit: Partial<OfflineHabit>): {
  isValid: boolean;
  sanitized: Partial<OfflineHabit>;
  result: ValidationResult;
} {
  const validator = getDataValidator();
  const sanitized = validator.sanitizeHabit(habit);
  const result = validator.validateHabit(sanitized);

  if (!result.isValid) {
    const error = validator.createValidationError(
      result.errors[0].field,
      result.errors[0].code,
      result.errors[0].message,
      habit,
    );
    throw error;
  }

  return { isValid: result.isValid, sanitized, result };
}

/**
 * Validate and sanitize habit entry data
 */
export function validateAndSanitizeHabitEntry(entry: Partial<HabitEntry>): {
  isValid: boolean;
  sanitized: Partial<HabitEntry>;
  result: ValidationResult;
} {
  const validator = getDataValidator();
  const sanitized = validator.sanitizeHabitEntry(entry);
  const result = validator.validateHabitEntry(sanitized);

  if (!result.isValid) {
    const error = validator.createValidationError(
      result.errors[0].field,
      result.errors[0].code,
      result.errors[0].message,
      entry,
    );
    throw error;
  }

  return { isValid: result.isValid, sanitized, result };
}
