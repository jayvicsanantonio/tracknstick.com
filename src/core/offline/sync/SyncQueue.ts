// Sync queue management for offline operations
// Handles operation queuing, retry logic, and dependency tracking for synchronization

import { SyncOperation } from '../types';
import { ISyncQueue, IDBManager } from '../interfaces';
import { generateId } from '../utils';

export class SyncQueue implements ISyncQueue {
  private dbManager: IDBManager;
  private readonly STORE_NAME = 'syncQueue';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [1000, 2000, 5000]; // exponential backoff in ms

  constructor(dbManager: IDBManager) {
    this.dbManager = dbManager;
  }

  async enqueue(
    operation: Omit<
      SyncOperation,
      'id' | 'timestamp' | 'retryCount' | 'status'
    >,
  ): Promise<string> {
    const id = generateId();
    const syncOperation: SyncOperation = {
      ...operation,
      id,
      timestamp: new Date(),
      retryCount: 0,
      status: 'PENDING',
      maxRetries: operation.maxRetries ?? this.MAX_RETRIES,
    };

    // Check for duplicate operations and merge if possible
    const existingOp = await this.findDuplicateOperation(syncOperation);
    if (existingOp) {
      return await this.mergeOperations(existingOp, syncOperation);
    }

    await this.dbManager.put(this.STORE_NAME, syncOperation);
    return id;
  }

  async dequeue(): Promise<SyncOperation | null> {
    // Get all pending operations sorted by priority and timestamp
    const operations = await this.getAllPendingOperations();
    if (operations.length === 0) {
      return null;
    }

    // Find the highest priority operation with satisfied dependencies
    const readyOperation = await this.findReadyOperation(operations);
    if (!readyOperation) {
      return null;
    }

    // Mark as in progress
    readyOperation.status = 'IN_PROGRESS';
    await this.dbManager.put(this.STORE_NAME, readyOperation);

    return readyOperation;
  }

  async peek(): Promise<SyncOperation | null> {
    const operations = await this.getAllPendingOperations();
    if (operations.length === 0) {
      return null;
    }

    return await this.findReadyOperation(operations);
  }

  async getAll(): Promise<SyncOperation[]> {
    return await this.dbManager.getAll<SyncOperation>(this.STORE_NAME);
  }

  async markCompleted(operationId: string): Promise<void> {
    const operation = await this.dbManager.get<SyncOperation>(
      this.STORE_NAME,
      operationId,
    );
    if (!operation) {
      throw new Error(`Operation not found: ${operationId}`);
    }

    operation.status = 'COMPLETED';
    await this.dbManager.put(this.STORE_NAME, operation);
  }

  async markFailed(operationId: string, error: string): Promise<void> {
    const operation = await this.dbManager.get<SyncOperation>(
      this.STORE_NAME,
      operationId,
    );
    if (!operation) {
      throw new Error(`Operation not found: ${operationId}`);
    }

    operation.retryCount++;
    operation.error = error;
    operation.status =
      operation.retryCount >= operation.maxRetries ? 'FAILED' : 'PENDING';

    await this.dbManager.put(this.STORE_NAME, operation);
  }

  async retry(operationId: string): Promise<void> {
    const operation = await this.dbManager.get<SyncOperation>(
      this.STORE_NAME,
      operationId,
    );
    if (!operation) {
      throw new Error(`Operation not found: ${operationId}`);
    }

    if (
      operation.status === 'FAILED' &&
      operation.retryCount < operation.maxRetries
    ) {
      operation.status = 'PENDING';
      operation.error = undefined;
      await this.dbManager.put(this.STORE_NAME, operation);
    }
  }

  async clear(): Promise<void> {
    await this.dbManager.clear(this.STORE_NAME);
  }

  async size(): Promise<number> {
    return await this.dbManager.count(this.STORE_NAME);
  }

  private async getAllPendingOperations(): Promise<SyncOperation[]> {
    const allOperations = await this.dbManager.getAll<SyncOperation>(
      this.STORE_NAME,
    );
    return allOperations
      .filter((op) => op.status === 'PENDING')
      .sort(() => {
        // TODO(human): Add priority sorting logic here
        // Consider: operation type, dependencies, timestamp, retry count
        // Return negative number if 'a' should come before 'b'
        // Return positive number if 'a' should come after 'b'
        // Return 0 if they have equal priority
        return 0; // Placeholder - maintains current order
      });
  }

  private async findDuplicateOperation(
    newOp: SyncOperation,
  ): Promise<SyncOperation | null> {
    const operations = await this.dbManager.getAll<SyncOperation>(
      this.STORE_NAME,
    );

    return (
      operations.find(
        (op) =>
          op.status === 'PENDING' &&
          op.entity === newOp.entity &&
          op.entityId === newOp.entityId,
      ) ?? null
    );
  }

  private async mergeOperations(
    existing: SyncOperation,
    newOp: SyncOperation,
  ): Promise<string> {
    // For UPDATE operations, merge the data
    if (existing.type === 'UPDATE' && newOp.type === 'UPDATE') {
      existing.data = {
        ...((existing.data as Record<string, unknown>) ?? {}),
        ...((newOp.data as Record<string, unknown>) ?? {}),
      };
      existing.timestamp = newOp.timestamp; // Use latest timestamp
      await this.dbManager.put(this.STORE_NAME, existing);
      return existing.id;
    }

    // For other cases, replace the existing operation
    existing.data = newOp.data;
    existing.timestamp = newOp.timestamp;
    existing.type = newOp.type;
    await this.dbManager.put(this.STORE_NAME, existing);
    return existing.id;
  }

  private async findReadyOperation(
    operations: SyncOperation[],
  ): Promise<SyncOperation | null> {
    for (const operation of operations) {
      if (await this.areDependenciesSatisfied(operation)) {
        return operation;
      }
    }
    return null;
  }

  private async areDependenciesSatisfied(
    operation: SyncOperation,
  ): Promise<boolean> {
    if (!operation.dependencies || operation.dependencies.length === 0) {
      return true;
    }

    const allOperations = await this.dbManager.getAll<SyncOperation>(
      this.STORE_NAME,
    );

    for (const depId of operation.dependencies) {
      const dependency = allOperations.find((op) => op.id === depId);
      if (!dependency || dependency.status !== 'COMPLETED') {
        return false;
      }
    }

    return true;
  }

  // Retry logic with exponential backoff
  getRetryDelay(retryCount: number): number {
    if (retryCount >= this.RETRY_DELAYS.length) {
      return this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];
    }
    return this.RETRY_DELAYS[retryCount];
  }

  async getFailedOperations(): Promise<SyncOperation[]> {
    const operations = await this.dbManager.getAll<SyncOperation>(
      this.STORE_NAME,
    );
    return operations.filter((op) => op.status === 'FAILED');
  }

  async getPendingCount(): Promise<number> {
    return await this.dbManager.count(this.STORE_NAME, 'status', 'PENDING');
  }

  async getInProgressCount(): Promise<number> {
    return await this.dbManager.count(this.STORE_NAME, 'status', 'IN_PROGRESS');
  }
}
