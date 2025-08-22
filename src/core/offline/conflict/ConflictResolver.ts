// Conflict resolution system for offline data synchronization
// Handles detection and resolution of data conflicts between local and server state

import { IConflictResolver } from '../interfaces';
import {
  ConflictData,
  OfflineHabit,
  HabitEntry,
  OfflineEntity,
} from '../types';

export class ConflictResolver implements IConflictResolver {
  /**
   * Detects if there's a conflict between local and server data
   */
  detectConflicts(localData: unknown, serverData: unknown): boolean {
    if (!localData || !serverData) {
      return false;
    }

    const local = localData as OfflineEntity;
    const server = serverData as OfflineEntity;

    // Check if both have been modified
    if (!local.lastModified || !server.lastModified) {
      return false;
    }

    // Compare version numbers if available
    if (local.version !== undefined && server.version !== undefined) {
      return local.version !== server.version;
    }

    // Fall back to timestamp comparison
    return local.lastModified.getTime() !== server.lastModified.getTime();
  }

  /**
   * Resolves a conflict using the specified resolution strategy
   */
  resolveConflict(
    conflict: ConflictData,
    resolution: 'LOCAL' | 'SERVER' | 'MERGE',
  ): Promise<unknown> {
    switch (resolution) {
      case 'LOCAL':
        return Promise.resolve(conflict.localData);

      case 'SERVER':
        return Promise.resolve(conflict.serverData);

      case 'MERGE':
        return Promise.resolve(
          this.mergeData(conflict.localData, conflict.serverData),
        );

      default:
        return Promise.reject(
          new Error(`Unknown resolution strategy: ${resolution as string}`),
        );
    }
  }

  /**
   * Presents a conflict to the user and returns their choice
   * In a real implementation, this would show a UI modal
   */
  presentConflict(
    conflict: ConflictData,
  ): Promise<'LOCAL' | 'SERVER' | 'MERGE'> {
    // For now, implement a simple last-write-wins strategy
    // TODO(human): Implement user interface for conflict resolution
    return Promise.resolve(this.getAutomaticResolution(conflict));
  }

  /**
   * Merges local and server data intelligently
   */
  mergeData(localData: unknown, serverData: unknown): unknown {
    if (!localData) return serverData;
    if (!serverData) return localData;

    const local = localData as OfflineEntity;
    const server = serverData as OfflineEntity;

    // Use the most recent timestamp for the merged data
    const useLocal = local.lastModified > server.lastModified;
    const base = useLocal ? { ...local } : { ...server };
    // const other = useLocal ? server : local;

    // Merge specific properties based on entity type
    if (this.isHabitData(local) && this.isHabitData(server)) {
      return this.mergeHabitData(local, server, base as OfflineHabit);
    }

    if (this.isHabitEntryData(local) && this.isHabitEntryData(server)) {
      return this.mergeHabitEntryData(local, server, base as HabitEntry);
    }

    // Default merge: take the newer version but preserve important fields
    return {
      ...base,
      version: Math.max(local.version ?? 0, server.version ?? 0) + 1,
      lastModified: new Date(),
      synced: false, // Mark as needing sync after merge
    };
  }

  /**
   * Determines automatic resolution strategy based on data analysis
   */
  private getAutomaticResolution(
    conflict: ConflictData,
  ): 'LOCAL' | 'SERVER' | 'MERGE' {
    const local = conflict.localData as OfflineEntity;
    const server = conflict.serverData as OfflineEntity;

    // If one side is marked as deleted, prefer the deletion
    if (local.deleted && !server.deleted) return 'LOCAL';
    if (!local.deleted && server.deleted) return 'SERVER';

    // If both are deleted, use server version
    if (local.deleted && server.deleted) return 'SERVER';

    // For non-deletion conflicts, prefer merge to preserve user data
    return 'MERGE';
  }

  /**
   * Type guard for habit data
   */
  private isHabitData(data: unknown): data is OfflineHabit {
    return (
      typeof data === 'object' &&
      data !== null &&
      'name' in data &&
      'icon' in data &&
      'frequency' in data
    );
  }

  /**
   * Type guard for habit entry data
   */
  private isHabitEntryData(data: unknown): data is HabitEntry {
    return (
      typeof data === 'object' &&
      data !== null &&
      'habitId' in data &&
      'date' in data &&
      'completed' in data
    );
  }

  /**
   * Merges two habit objects intelligently
   */
  private mergeHabitData(
    local: OfflineHabit,
    server: OfflineHabit,
    base: OfflineHabit,
  ): OfflineHabit {
    return {
      ...base,
      // Prefer local changes for user-facing content
      name: local.lastModified > server.lastModified ? local.name : server.name,
      icon: local.lastModified > server.lastModified ? local.icon : server.icon,
      frequency:
        local.lastModified > server.lastModified
          ? local.frequency
          : server.frequency,
      completed:
        local.lastModified > server.lastModified
          ? local.completed
          : server.completed,
      startDate:
        local.lastModified > server.lastModified
          ? local.startDate
          : server.startDate,
      endDate:
        local.lastModified > server.lastModified
          ? local.endDate
          : server.endDate,
      // Merge metadata
      version: Math.max(local.version ?? 0, server.version ?? 0) + 1,
      lastModified: new Date(),
      synced: false,
    };
  }

  /**
   * Merges two habit entry objects intelligently
   */
  private mergeHabitEntryData(
    local: HabitEntry,
    server: HabitEntry,
    base: HabitEntry,
  ): HabitEntry {
    return {
      ...base,
      // For habit entries, prefer the most recent completion status
      completed:
        local.lastModified > server.lastModified
          ? local.completed
          : server.completed,
      // Merge metadata
      version: Math.max(local.version ?? 0, server.version ?? 0) + 1,
      lastModified: new Date(),
      synced: false,
    };
  }
}
