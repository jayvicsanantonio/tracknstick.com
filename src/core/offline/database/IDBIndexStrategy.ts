// Advanced indexing strategies for IndexedDB performance optimization
// Provides compound indexes and query optimization for common access patterns

export interface IndexDefinition {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
  purpose: string;
}

export interface StoreIndexes {
  storeName: string;
  indexes: IndexDefinition[];
}

/**
 * Optimized index definitions based on common query patterns
 * These indexes are designed to support the most frequent queries efficiently
 */
export const OPTIMIZED_INDEX_STRATEGIES: StoreIndexes[] = [
  {
    storeName: 'habits',
    indexes: [
      // Single field indexes
      {
        name: 'localId',
        keyPath: 'localId',
        options: { unique: false },
        purpose: 'Quick lookup by local ID for client-side operations',
      },
      {
        name: 'serverId',
        keyPath: 'serverId',
        options: { unique: false },
        purpose: 'Server ID mapping for sync operations',
      },
      {
        name: 'synced',
        keyPath: 'synced',
        options: { unique: false },
        purpose: 'Filter unsynced habits for sync queue processing',
      },
      {
        name: 'lastModified',
        keyPath: 'lastModified',
        options: { unique: false },
        purpose: 'Sort habits by modification date, conflict resolution',
      },
      {
        name: 'deleted',
        keyPath: 'deleted',
        options: { unique: false },
        purpose: 'Filter deleted habits efficiently',
      },
      {
        name: 'active',
        keyPath: 'active',
        options: { unique: false },
        purpose: 'Filter active habits for main view',
      },

      // Compound indexes for complex queries
      {
        name: 'synced_deleted',
        keyPath: ['synced', 'deleted'],
        options: { unique: false },
        purpose: 'Get active unsynced habits for sync processing',
      },
      {
        name: 'active_lastModified',
        keyPath: ['active', 'lastModified'],
        options: { unique: false },
        purpose: 'Get active habits sorted by modification date',
      },
      {
        name: 'deleted_lastModified',
        keyPath: ['deleted', 'lastModified'],
        options: { unique: false },
        purpose: 'Cleanup old deleted habits efficiently',
      },
    ],
  },

  {
    storeName: 'habitEntries',
    indexes: [
      // Single field indexes
      {
        name: 'habitId',
        keyPath: 'habitId',
        options: { unique: false },
        purpose: 'Get all entries for a specific habit',
      },
      {
        name: 'date',
        keyPath: 'date',
        options: { unique: false },
        purpose: 'Get entries for specific date, date range queries',
      },
      {
        name: 'synced',
        keyPath: 'synced',
        options: { unique: false },
        purpose: 'Filter unsynced entries for sync processing',
      },
      {
        name: 'completed',
        keyPath: 'completed',
        options: { unique: false },
        purpose: 'Filter completed/uncompleted entries',
      },
      {
        name: 'lastModified',
        keyPath: 'lastModified',
        options: { unique: false },
        purpose: 'Conflict resolution and sync ordering',
      },

      // Compound indexes for complex queries
      {
        name: 'habitId_date',
        keyPath: ['habitId', 'date'],
        options: { unique: true },
        purpose: 'Unique constraint and efficient habit completion lookup',
      },
      {
        name: 'habitId_synced',
        keyPath: ['habitId', 'synced'],
        options: { unique: false },
        purpose: 'Get unsynced entries for specific habit',
      },
      {
        name: 'date_completed',
        keyPath: ['date', 'completed'],
        options: { unique: false },
        purpose: 'Daily statistics and completion analysis',
      },
      {
        name: 'habitId_date_completed',
        keyPath: ['habitId', 'date', 'completed'],
        options: { unique: false },
        purpose: 'Efficient habit streak calculations',
      },
      {
        name: 'synced_lastModified',
        keyPath: ['synced', 'lastModified'],
        options: { unique: false },
        purpose: 'Process sync queue in modification order',
      },
    ],
  },

  {
    storeName: 'syncQueue',
    indexes: [
      // Single field indexes
      {
        name: 'status',
        keyPath: 'status',
        options: { unique: false },
        purpose:
          'Filter operations by status (pending, in_progress, completed, failed)',
      },
      {
        name: 'timestamp',
        keyPath: 'timestamp',
        options: { unique: false },
        purpose: 'Process operations in chronological order',
      },
      {
        name: 'entity',
        keyPath: 'entity',
        options: { unique: false },
        purpose: 'Filter by entity type (HABIT, HABIT_ENTRY)',
      },
      {
        name: 'entityId',
        keyPath: 'entityId',
        options: { unique: false },
        purpose: 'Find operations for specific entity',
      },
      {
        name: 'priority',
        keyPath: 'priority',
        options: { unique: false },
        purpose: 'Process high priority operations first',
      },

      // Compound indexes
      {
        name: 'status_timestamp',
        keyPath: ['status', 'timestamp'],
        options: { unique: false },
        purpose: 'Get pending operations in chronological order',
      },
      {
        name: 'entity_entityId',
        keyPath: ['entity', 'entityId'],
        options: { unique: false },
        purpose: 'Find all operations for specific entity instance',
      },
      {
        name: 'status_priority_timestamp',
        keyPath: ['status', 'priority', 'timestamp'],
        options: { unique: false },
        purpose: 'Process operations by status, priority, then time',
      },
    ],
  },

  {
    storeName: 'conflicts',
    indexes: [
      // Single field indexes
      {
        name: 'entityType',
        keyPath: 'entityType',
        options: { unique: false },
        purpose: 'Filter conflicts by entity type',
      },
      {
        name: 'resolved',
        keyPath: 'resolved',
        options: { unique: false },
        purpose: 'Filter unresolved conflicts for UI display',
      },
      {
        name: 'timestamp',
        keyPath: 'timestamp',
        options: { unique: false },
        purpose: 'Show conflicts in chronological order',
      },
      {
        name: 'entityId',
        keyPath: 'entityId',
        options: { unique: false },
        purpose: 'Find conflicts for specific entity',
      },

      // Compound indexes
      {
        name: 'resolved_timestamp',
        keyPath: ['resolved', 'timestamp'],
        options: { unique: false },
        purpose: 'Get unresolved conflicts in chronological order',
      },
      {
        name: 'entityType_resolved',
        keyPath: ['entityType', 'resolved'],
        options: { unique: false },
        purpose: 'Filter unresolved conflicts by entity type',
      },
    ],
  },
  {
    storeName: 'metadata',
    indexes: [
      // Basic key-value store, no additional indexes needed beyond primary key
    ],
  },
];

/**
 * Query optimization patterns for common operations
 */
export const QUERY_OPTIMIZATION_PATTERNS = {
  // Habit queries
  getActiveHabits: {
    storeName: 'habits',
    indexName: 'active_lastModified',
    keyPath: [true, null], // active=true, any lastModified
    description: 'Get all active habits sorted by last modified',
  },

  getUnsyncedHabits: {
    storeName: 'habits',
    indexName: 'synced_deleted',
    keyPath: [false, false], // synced=false, deleted=false
    description: 'Get active unsynced habits for sync processing',
  },

  // Entry queries
  getHabitEntriesForDate: {
    storeName: 'habitEntries',
    indexName: 'date_completed',
    description: 'Get all entries for a specific date with completion status',
  },

  getHabitCompletionForDateRange: {
    storeName: 'habitEntries',
    indexName: 'habitId_date_completed',
    description: 'Efficient habit streak and completion analysis',
  },

  getUnsyncedEntries: {
    storeName: 'habitEntries',
    indexName: 'synced_lastModified',
    keyPath: [false, null], // synced=false, any lastModified
    description: 'Get unsynced entries in modification order',
  },

  // Sync queue queries
  getPendingSyncOperations: {
    storeName: 'syncQueue',
    indexName: 'status_priority_timestamp',
    keyPath: ['PENDING', null, null], // status=PENDING, any priority/timestamp
    description: 'Get pending operations sorted by priority then timestamp',
  },

  getOperationsForEntity: {
    storeName: 'syncQueue',
    indexName: 'entity_entityId',
    description: 'Find all sync operations for a specific entity',
  },

  // Conflict queries
  getUnresolvedConflicts: {
    storeName: 'conflicts',
    indexName: 'resolved_timestamp',
    keyPath: [false, null], // resolved=false, any timestamp
    description: 'Get unresolved conflicts in chronological order',
  },
};

/**
 * Index performance metrics and recommendations
 */
export interface IndexPerformanceMetrics {
  indexName: string;
  storeName: string;
  usage: number;
  averageQueryTime: number;
  selectivity: number; // How selective the index is (lower is better)
  recommendation: 'keep' | 'optimize' | 'remove';
}

/**
 * Analyze index performance and provide recommendations
 */
export class IndexAnalyzer {
  private queryTimes = new Map<string, number[]>();
  private indexUsage = new Map<string, number>();

  recordQuery(
    storeName: string,
    indexName: string | undefined,
    queryTime: number,
  ): void {
    const key = `${storeName}:${indexName ?? 'primary'}`;

    if (!this.queryTimes.has(key)) {
      this.queryTimes.set(key, []);
      this.indexUsage.set(key, 0);
    }

    this.queryTimes.get(key)!.push(queryTime);
    this.indexUsage.set(key, this.indexUsage.get(key)! + 1);
  }

  getPerformanceReport(): IndexPerformanceMetrics[] {
    const metrics: IndexPerformanceMetrics[] = [];

    for (const [key, times] of this.queryTimes) {
      const [storeName, indexName] = key.split(':');
      const usage = this.indexUsage.get(key) ?? 0;
      const averageQueryTime = times.reduce((a, b) => a + b, 0) / times.length;

      // Simple selectivity estimation (would need actual cardinality data for accuracy)
      const selectivity = averageQueryTime / 100; // Rough estimation

      let recommendation: 'keep' | 'optimize' | 'remove' = 'keep';
      if (usage < 10 && averageQueryTime > 50) {
        recommendation = 'remove';
      } else if (averageQueryTime > 100) {
        recommendation = 'optimize';
      }

      metrics.push({
        indexName,
        storeName,
        usage,
        averageQueryTime,
        selectivity,
        recommendation,
      });
    }

    return metrics;
  }

  reset(): void {
    this.queryTimes.clear();
    this.indexUsage.clear();
  }
}

// Global analyzer instance
export const indexAnalyzer = new IndexAnalyzer();
