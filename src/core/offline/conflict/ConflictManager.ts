// Conflict management system for sync operations
// Handles conflict detection, storage, and resolution coordination

import { ConflictData, OfflineEntity } from '../types';
import { IDBManager, IConflictResolver } from '../interfaces';
import { ConflictResolver } from './ConflictResolver';
import { generateId } from '../utils';

export class ConflictManager {
  private dbManager: IDBManager;
  private resolver: IConflictResolver;
  private readonly STORE_NAME = 'conflicts';

  constructor(dbManager: IDBManager, resolver?: IConflictResolver) {
    this.dbManager = dbManager;
    this.resolver = resolver ?? new ConflictResolver();
  }

  /**
   * Detects and stores conflicts between local and server data
   */
  async detectAndStoreConflicts(
    entityType: 'HABIT' | 'HABIT_ENTRY',
    entityId: string,
    localData: OfflineEntity,
    serverData: OfflineEntity,
  ): Promise<ConflictData | null> {
    const hasConflict = this.resolver.detectConflicts(localData, serverData);

    if (!hasConflict) {
      return null;
    }

    // Check if conflict already exists for this entity
    const existingConflict = await this.getConflictByEntity(
      entityType,
      entityId,
    );
    if (existingConflict && !existingConflict.resolved) {
      // Update existing conflict with new data
      existingConflict.localData = localData;
      existingConflict.serverData = serverData;
      existingConflict.timestamp = new Date();
      await this.dbManager.put(this.STORE_NAME, existingConflict);
      return existingConflict;
    }

    // Create new conflict record
    const conflict: ConflictData = {
      id: generateId(),
      entityType,
      entityId,
      localData,
      serverData,
      timestamp: new Date(),
      resolved: false,
    };

    await this.dbManager.put(this.STORE_NAME, conflict);
    return conflict;
  }

  /**
   * Resolves a specific conflict using the provided strategy
   */
  async resolveConflict(
    conflictId: string,
    resolution: 'LOCAL' | 'SERVER' | 'MERGE',
  ): Promise<unknown> {
    const conflict = await this.dbManager.get<ConflictData>(
      this.STORE_NAME,
      conflictId,
    );

    if (!conflict) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }

    const resolvedData = await this.resolver.resolveConflict(
      conflict,
      resolution,
    );

    // Mark conflict as resolved
    conflict.resolved = true;
    conflict.resolution = resolution;
    await this.dbManager.put(this.STORE_NAME, conflict);

    return resolvedData;
  }

  /**
   * Automatically resolves conflicts using the resolver's logic
   */
  async autoResolveConflict(conflictId: string): Promise<unknown> {
    const conflict = await this.dbManager.get<ConflictData>(
      this.STORE_NAME,
      conflictId,
    );

    if (!conflict) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }

    const resolution = await this.resolver.presentConflict(conflict);
    return await this.resolveConflict(conflictId, resolution);
  }

  /**
   * Gets all unresolved conflicts
   */
  async getUnresolvedConflicts(): Promise<ConflictData[]> {
    const allConflicts = await this.dbManager.getAll<ConflictData>(
      this.STORE_NAME,
    );
    return allConflicts.filter((conflict) => !conflict.resolved);
  }

  /**
   * Gets all conflicts for a specific entity
   */
  async getConflictsByEntity(
    entityType: 'HABIT' | 'HABIT_ENTRY',
    entityId: string,
  ): Promise<ConflictData[]> {
    const allConflicts = await this.dbManager.getAll<ConflictData>(
      this.STORE_NAME,
    );
    return allConflicts.filter(
      (conflict) =>
        conflict.entityType === entityType && conflict.entityId === entityId,
    );
  }

  /**
   * Gets a specific conflict by entity (unresolved only)
   */
  async getConflictByEntity(
    entityType: 'HABIT' | 'HABIT_ENTRY',
    entityId: string,
  ): Promise<ConflictData | null> {
    const conflicts = await this.getConflictsByEntity(entityType, entityId);
    return conflicts.find((conflict) => !conflict.resolved) ?? null;
  }

  /**
   * Gets count of unresolved conflicts
   */
  async getConflictCount(): Promise<number> {
    const conflicts = await this.getUnresolvedConflicts();
    return conflicts.length;
  }

  /**
   * Resolves all conflicts automatically
   */
  async resolveAllConflicts(): Promise<void> {
    const unresolvedConflicts = await this.getUnresolvedConflicts();

    for (const conflict of unresolvedConflicts) {
      try {
        await this.autoResolveConflict(conflict.id);
      } catch (error) {
        console.error(`Failed to resolve conflict ${conflict.id}:`, error);
        // Continue with other conflicts even if one fails
      }
    }
  }

  /**
   * Presents conflicts to user for manual resolution
   */
  async presentConflictsToUser(): Promise<ConflictData[]> {
    const conflicts = await this.getUnresolvedConflicts();

    // In a real implementation, this would trigger UI notifications
    // For now, just return the conflicts that need user attention
    return conflicts.filter((conflict) => {
      // Only present conflicts that can't be auto-resolved
      const local = conflict.localData as OfflineEntity;
      const server = conflict.serverData as OfflineEntity;

      // Auto-resolve if one side is deleted
      if (local.deleted !== server.deleted) {
        return false;
      }

      // Present complex conflicts to user
      return true;
    });
  }

  /**
   * Clears all resolved conflicts older than the specified date
   */
  async cleanupResolvedConflicts(olderThan: Date): Promise<void> {
    const allConflicts = await this.dbManager.getAll<ConflictData>(
      this.STORE_NAME,
    );
    const toDelete = allConflicts.filter(
      (conflict) => conflict.resolved && conflict.timestamp < olderThan,
    );

    for (const conflict of toDelete) {
      await this.dbManager.delete(this.STORE_NAME, conflict.id);
    }
  }

  /**
   * Checks if sync operation would cause conflicts
   */
  async checkForPotentialConflicts(
    entityType: 'HABIT' | 'HABIT_ENTRY',
    entityId: string,
  ): Promise<boolean> {
    // This would typically check against pending sync operations
    // or known server state to predict conflicts before they happen
    const existingConflict = await this.getConflictByEntity(
      entityType,
      entityId,
    );
    return existingConflict !== null;
  }

  /**
   * Subscribes to conflict events (for UI notifications)
   */
  onConflictDetected(): () => void {
    // In a real implementation, this would set up event listeners
    // For now, return a no-op unsubscribe function
    return () => {
      // Unsubscribe logic will be implemented when needed
    };
  }

  /**
   * Gets conflict statistics for monitoring
   */
  async getConflictStats(): Promise<{
    total: number;
    unresolved: number;
    autoResolved: number;
    userResolved: number;
  }> {
    const allConflicts = await this.dbManager.getAll<ConflictData>(
      this.STORE_NAME,
    );

    return {
      total: allConflicts.length,
      unresolved: allConflicts.filter((c) => !c.resolved).length,
      autoResolved: allConflicts.filter(
        (c) => c.resolved && c.resolution === 'MERGE',
      ).length,
      userResolved: allConflicts.filter(
        (c) => c.resolved && c.resolution !== 'MERGE',
      ).length,
    };
  }
}
