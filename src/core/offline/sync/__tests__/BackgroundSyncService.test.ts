// Tests for BackgroundSyncService
// Validates automatic sync triggers, periodic sync, and connectivity-based sync

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BackgroundSyncService, SyncEvent } from '../BackgroundSyncService';
import { OfflineStore } from '../../store/OfflineStore';
import { ConnectivityMonitor } from '../../connectivity/ConnectivityMonitor';
import { ConnectivityStatus } from '../../types';

// Mock dependencies
vi.mock('../../store/OfflineStore');
vi.mock('../../connectivity/ConnectivityMonitor');

describe('BackgroundSyncService', () => {
  let backgroundSyncService: BackgroundSyncService;
  let mockOfflineStore: vi.Mocked<OfflineStore>;
  let mockConnectivityMonitor: vi.Mocked<ConnectivityMonitor>;

  const mockConnectivityStatus: ConnectivityStatus = {
    online: true,
    quality: 'good',
    lastOnline: new Date(),
    lastOffline: null,
  };

  const mockBatchSyncResult = {
    totalOperations: 5,
    successfulOperations: 4,
    failedOperations: 1,
    networkErrors: 0,
    results: [],
  };

  beforeEach(() => {
    vi.useFakeTimers();

    mockOfflineStore = {
      sync: vi.fn().mockResolvedValue(mockBatchSyncResult),
      getSyncStatus: vi.fn(),
      initialize: vi.fn(),
      getHabits: vi.fn(),
      createHabit: vi.fn(),
      updateHabit: vi.fn(),
      deleteHabit: vi.fn(),
      resolveConflicts: vi.fn(),
    } as any;

    mockConnectivityMonitor = {
      isOnline: vi.fn().mockReturnValue(true),
      getStatus: vi.fn().mockReturnValue(mockConnectivityStatus),
      subscribe: vi.fn().mockReturnValue(() => {}),
      checkConnectivity: vi.fn(),
      assessQuality: vi.fn(),
    } as any;

    backgroundSyncService = new BackgroundSyncService(
      mockOfflineStore,
      mockConnectivityMonitor,
      {
        periodicSyncInterval: 60000, // 1 minute for testing
        retryDelay: 10000, // 10 seconds for testing
        maxRetries: 2,
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    backgroundSyncService.stop();
  });

  describe('Service lifecycle', () => {
    it('should start and stop correctly', () => {
      expect(backgroundSyncService.getStatus().isRunning).toBe(false);

      backgroundSyncService.start();
      expect(backgroundSyncService.getStatus().isRunning).toBe(true);
      expect(mockConnectivityMonitor.subscribe).toHaveBeenCalled();

      backgroundSyncService.stop();
      expect(backgroundSyncService.getStatus().isRunning).toBe(false);
    });

    it('should not start multiple times', () => {
      backgroundSyncService.start();
      backgroundSyncService.start(); // Should be ignored

      expect(mockConnectivityMonitor.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should not stop when not running', () => {
      backgroundSyncService.stop(); // Should not throw
      expect(backgroundSyncService.getStatus().isRunning).toBe(false);
    });
  });

  describe('User-initiated sync', () => {
    it('should trigger sync successfully', async () => {
      const result = await backgroundSyncService.triggerSync('user_initiated');

      expect(mockOfflineStore.sync).toHaveBeenCalled();
      expect(result).toEqual(mockBatchSyncResult);
      expect(backgroundSyncService.getStatus().consecutiveFailures).toBe(1); // Has 1 failed operation
    });

    it('should throw error when offline', async () => {
      mockConnectivityMonitor.isOnline.mockReturnValue(false);

      await expect(
        backgroundSyncService.triggerSync('user_initiated'),
      ).rejects.toThrow('Cannot sync while offline');

      expect(mockOfflineStore.sync).not.toHaveBeenCalled();
    });

    it('should handle sync failures', async () => {
      const error = new Error('Sync failed');
      mockOfflineStore.sync.mockRejectedValue(error);

      await expect(
        backgroundSyncService.triggerSync('user_initiated'),
      ).rejects.toThrow('Sync failed');

      expect(backgroundSyncService.getStatus().consecutiveFailures).toBe(1);
    });

    it('should reset consecutive failures on successful sync', async () => {
      // First, trigger a failure
      mockOfflineStore.sync.mockRejectedValueOnce(new Error('Sync failed'));
      await backgroundSyncService.triggerSync('user_initiated').catch(() => {});
      expect(backgroundSyncService.getStatus().consecutiveFailures).toBe(1);

      // Then trigger a success (no failed operations)
      mockOfflineStore.sync.mockResolvedValueOnce({
        ...mockBatchSyncResult,
        failedOperations: 0,
      });
      await backgroundSyncService.triggerSync('user_initiated');
      expect(backgroundSyncService.getStatus().consecutiveFailures).toBe(0);
    });
  });

  describe('Periodic sync', () => {
    it('should schedule periodic sync when started', () => {
      backgroundSyncService.start();

      // Fast forward to trigger periodic sync
      vi.advanceTimersByTime(60000); // 1 minute

      expect(mockOfflineStore.sync).toHaveBeenCalled();
    });

    it('should not trigger periodic sync when offline', () => {
      mockConnectivityMonitor.isOnline.mockReturnValue(false);
      backgroundSyncService.start();

      vi.advanceTimersByTime(60000);

      expect(mockOfflineStore.sync).not.toHaveBeenCalled();
    });

    it('should continue scheduling periodic syncs', () => {
      backgroundSyncService.start();

      // First periodic sync
      vi.advanceTimersByTime(60000);
      expect(mockOfflineStore.sync).toHaveBeenCalledTimes(1);

      // Second periodic sync
      vi.advanceTimersByTime(60000);
      expect(mockOfflineStore.sync).toHaveBeenCalledTimes(2);
    });

    it('should stop periodic sync when service is stopped', () => {
      backgroundSyncService.start();
      vi.advanceTimersByTime(30000); // Half the interval
      backgroundSyncService.stop();

      // Complete the interval
      vi.advanceTimersByTime(30000);

      expect(mockOfflineStore.sync).not.toHaveBeenCalled();
    });

    it('should disable periodic sync when option is false', () => {
      const service = new BackgroundSyncService(
        mockOfflineStore,
        mockConnectivityMonitor,
        { enablePeriodicSync: false },
      );

      service.start();
      vi.advanceTimersByTime(300000); // Default interval

      expect(mockOfflineStore.sync).not.toHaveBeenCalled();
    });
  });

  describe('Connectivity-based sync', () => {
    it('should trigger sync when connectivity is restored', async () => {
      let connectivityCallback: (status: ConnectivityStatus) => void;
      mockConnectivityMonitor.subscribe.mockImplementation((callback) => {
        connectivityCallback = callback;
        return () => {};
      });

      backgroundSyncService.start();

      // Simulate connectivity restoration after sufficient delay
      backgroundSyncService['lastSyncAttempt'] = new Date(Date.now() - 70000); // 70 seconds ago
      connectivityCallback!({ ...mockConnectivityStatus, online: true });

      // Wait for async operation
      await vi.runAllTimersAsync();

      expect(mockOfflineStore.sync).toHaveBeenCalled();
    });

    it('should not trigger sync if recent sync attempt', () => {
      let connectivityCallback: (status: ConnectivityStatus) => void;
      mockConnectivityMonitor.subscribe.mockImplementation((callback) => {
        connectivityCallback = callback;
        return () => {};
      });

      backgroundSyncService.start();

      // Simulate recent sync attempt
      backgroundSyncService['lastSyncAttempt'] = new Date(Date.now() - 5000); // 5 seconds ago
      connectivityCallback!({ ...mockConnectivityStatus, online: true });

      expect(mockOfflineStore.sync).not.toHaveBeenCalled();
    });

    it('should not trigger sync when going offline', () => {
      let connectivityCallback: (status: ConnectivityStatus) => void;
      mockConnectivityMonitor.subscribe.mockImplementation((callback) => {
        connectivityCallback = callback;
        return () => {};
      });

      backgroundSyncService.start();

      connectivityCallback!({ ...mockConnectivityStatus, online: false });

      expect(mockOfflineStore.sync).not.toHaveBeenCalled();
    });
  });

  describe('Retry mechanism', () => {
    it('should schedule retry after partial failure', async () => {
      await backgroundSyncService.triggerSync('user_initiated');

      expect(backgroundSyncService.getStatus().consecutiveFailures).toBe(1);

      // Fast forward to trigger retry
      vi.advanceTimersByTime(10000); // Initial retry delay

      expect(mockOfflineStore.sync).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff for retries', async () => {
      // First failure
      await backgroundSyncService.triggerSync('user_initiated');

      // Second failure (should increase backoff)
      vi.advanceTimersByTime(10000);
      await vi.runAllTimersAsync();

      expect(backgroundSyncService.getStatus().consecutiveFailures).toBe(2);

      // Third attempt should have longer delay (exponential backoff)
      vi.advanceTimersByTime(10000); // Original delay
      expect(mockOfflineStore.sync).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(10000); // Additional backoff
      expect(mockOfflineStore.sync).toHaveBeenCalledTimes(3);
    });

    it('should stop retrying after max retries', async () => {
      // Trigger failures up to max retries
      await backgroundSyncService.triggerSync('user_initiated');

      vi.advanceTimersByTime(10000);
      await vi.runAllTimersAsync();

      vi.advanceTimersByTime(20000);
      await vi.runAllTimersAsync();

      expect(backgroundSyncService.getStatus().consecutiveFailures).toBe(2);

      // Should not schedule more retries
      vi.advanceTimersByTime(60000);
      expect(mockOfflineStore.sync).toHaveBeenCalledTimes(3); // No additional calls
    });

    it('should not retry when offline', async () => {
      await backgroundSyncService.triggerSync('user_initiated');

      mockConnectivityMonitor.isOnline.mockReturnValue(false);

      vi.advanceTimersByTime(10000);
      await vi.runAllTimersAsync();

      expect(mockOfflineStore.sync).toHaveBeenCalledTimes(1); // No retry
    });
  });

  describe('Event emission', () => {
    it('should emit sync events', async () => {
      const eventListener = vi.fn();
      const unsubscribe = backgroundSyncService.onSyncEvent(eventListener);

      await backgroundSyncService.triggerSync('user_initiated');

      expect(eventListener).toHaveBeenCalledWith({
        type: 'user_initiated',
        timestamp: expect.any(Date),
        result: mockBatchSyncResult,
      });

      unsubscribe();
    });

    it('should emit error events', async () => {
      const eventListener = vi.fn();
      backgroundSyncService.onSyncEvent(eventListener);

      const error = new Error('Sync failed');
      mockOfflineStore.sync.mockRejectedValue(error);

      await backgroundSyncService.triggerSync('user_initiated').catch(() => {});

      expect(eventListener).toHaveBeenCalledWith({
        type: 'user_initiated',
        timestamp: expect.any(Date),
        error: 'Sync failed',
      });
    });

    it('should handle event listener errors gracefully', async () => {
      const faultyListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      backgroundSyncService.onSyncEvent(faultyListener);

      // Should not throw despite listener error
      await expect(
        backgroundSyncService.triggerSync('user_initiated'),
      ).resolves.toEqual(mockBatchSyncResult);
    });

    it('should unsubscribe event listeners', async () => {
      const eventListener = vi.fn();
      const unsubscribe = backgroundSyncService.onSyncEvent(eventListener);

      unsubscribe();

      await backgroundSyncService.triggerSync('user_initiated');

      expect(eventListener).not.toHaveBeenCalled();
    });
  });

  describe('Status reporting', () => {
    it('should report correct status', () => {
      const status = backgroundSyncService.getStatus();

      expect(status).toEqual({
        isRunning: false,
        lastSyncAttempt: null,
        consecutiveFailures: 0,
        nextPeriodicSync: null,
        nextRetry: null,
      });
    });

    it('should update status after sync attempts', async () => {
      await backgroundSyncService.triggerSync('user_initiated');

      const status = backgroundSyncService.getStatus();

      expect(status.lastSyncAttempt).toBeInstanceOf(Date);
      expect(status.consecutiveFailures).toBe(1);
    });
  });

  describe('Options management', () => {
    it('should update options dynamically', () => {
      backgroundSyncService.updateOptions({
        periodicSyncInterval: 30000,
        enablePeriodicSync: false,
      });

      // Verify options were updated by checking that periodic sync doesn't trigger
      backgroundSyncService.start();
      vi.advanceTimersByTime(60000);

      expect(mockOfflineStore.sync).not.toHaveBeenCalled();
    });

    it('should restart periodic sync when re-enabled', () => {
      backgroundSyncService.updateOptions({ enablePeriodicSync: false });
      backgroundSyncService.start();

      vi.advanceTimersByTime(60000);
      expect(mockOfflineStore.sync).not.toHaveBeenCalled();

      backgroundSyncService.updateOptions({ enablePeriodicSync: true });
      vi.advanceTimersByTime(60000);

      expect(mockOfflineStore.sync).toHaveBeenCalled();
    });
  });
});
