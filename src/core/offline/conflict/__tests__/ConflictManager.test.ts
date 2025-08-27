// Unit tests for ConflictManager class
// Tests conflict detection, storage, resolution coordination, and management

import { vi } from 'vitest';
import { ConflictManager } from '../ConflictManager';
import { ConflictResolver } from '../ConflictResolver';
import { ConflictData, OfflineHabit, HabitEntry } from '../../types';
import { IDBManager } from '../../interfaces';

// Mock IDBManager
const mockIDBManager = {
  initialize: vi.fn(),
  close: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  putMany: vi.fn(),
  deleteMany: vi.fn(),
  getByIndex: vi.fn(),
  getByDateRange: vi.fn(),
  count: vi.fn(),
  transaction: vi.fn(),
} as any;

// Mock ConflictResolver
const mockConflictResolver = {
  detectConflicts: vi.fn(),
  resolveConflict: vi.fn(),
  presentConflict: vi.fn(),
  mergeData: vi.fn(),
} as any;

describe('ConflictManager', () => {
  let conflictManager: ConflictManager;

  beforeEach(() => {
    vi.clearAllMocks();
    conflictManager = new ConflictManager(mockIDBManager, mockConflictResolver);
  });

  describe('detectAndStoreConflicts', () => {
    const localHabit: OfflineHabit = {
      id: 'habit-1',
      name: 'Local Habit',
      description: 'Local Description',
      color: '#ff0000',
      userId: 'user-1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-03'),
      lastModified: new Date('2023-01-03'),
      version: 1,
      synced: false,
    };

    const serverHabit: OfflineHabit = {
      id: 'habit-1',
      name: 'Server Habit',
      description: 'Server Description',
      color: '#00ff00',
      userId: 'user-1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
      lastModified: new Date('2023-01-02'),
      version: 2,
      synced: true,
    };

    it('should return null when no conflict is detected', async () => {
      mockConflictResolver.detectConflicts.mockReturnValue(false);

      const result = await conflictManager.detectAndStoreConflicts(
        'HABIT',
        'habit-1',
        localHabit,
        serverHabit,
      );

      expect(result).toBeNull();
      expect(mockIDBManager.put).not.toHaveBeenCalled();
    });

    it('should create and store new conflict when detected', async () => {
      mockConflictResolver.detectConflicts.mockReturnValue(true);
      mockIDBManager.getAll.mockResolvedValue([]);
      mockIDBManager.put.mockResolvedValue('conflict-id');

      const result = await conflictManager.detectAndStoreConflicts(
        'HABIT',
        'habit-1',
        localHabit,
        serverHabit,
      );

      expect(result).toBeDefined();
      expect(result!.entityType).toBe('HABIT');
      expect(result!.entityId).toBe('habit-1');
      expect(result!.localData).toBe(localHabit);
      expect(result!.serverData).toBe(serverHabit);
      expect(result!.resolved).toBe(false);
      expect(mockIDBManager.put).toHaveBeenCalledWith(
        'conflicts',
        expect.any(Object),
      );
    });

    it('should update existing unresolved conflict', async () => {
      const existingConflict: ConflictData = {
        id: 'existing-conflict',
        entityType: 'HABIT',
        entityId: 'habit-1',
        localData: {},
        serverData: {},
        timestamp: new Date('2023-01-01'),
        resolved: false,
      };

      mockConflictResolver.detectConflicts.mockReturnValue(true);
      mockIDBManager.getAll.mockResolvedValue([existingConflict]);

      const result = await conflictManager.detectAndStoreConflicts(
        'HABIT',
        'habit-1',
        localHabit,
        serverHabit,
      );

      expect(result).toBeDefined();
      expect(result!.id).toBe('existing-conflict');
      expect(result!.localData).toBe(localHabit);
      expect(result!.serverData).toBe(serverHabit);
      expect(mockIDBManager.put).toHaveBeenCalledWith(
        'conflicts',
        existingConflict,
      );
    });
  });

  describe('resolveConflict', () => {
    const mockConflict: ConflictData = {
      id: 'conflict-1',
      entityType: 'HABIT',
      entityId: 'habit-1',
      localData: { name: 'Local' },
      serverData: { name: 'Server' },
      timestamp: new Date(),
      resolved: false,
    };

    it('should resolve conflict and mark as resolved', async () => {
      const resolvedData = { name: 'Merged' };
      mockIDBManager.get.mockResolvedValue(mockConflict);
      mockConflictResolver.resolveConflict.mockResolvedValue(resolvedData);

      const result = await conflictManager.resolveConflict(
        'conflict-1',
        'MERGE',
      );

      expect(result).toBe(resolvedData);
      expect(mockConflict.resolved).toBe(true);
      expect(mockConflict.resolution).toBe('MERGE');
      expect(mockIDBManager.put).toHaveBeenCalledWith(
        'conflicts',
        mockConflict,
      );
    });

    it('should throw error when conflict not found', async () => {
      mockIDBManager.get.mockResolvedValue(undefined);

      await expect(
        conflictManager.resolveConflict('nonexistent', 'LOCAL'),
      ).rejects.toThrow('Conflict not found: nonexistent');
    });
  });

  describe('autoResolveConflict', () => {
    it('should use resolver to determine resolution strategy', async () => {
      const mockConflict: ConflictData = {
        id: 'conflict-1',
        entityType: 'HABIT',
        entityId: 'habit-1',
        localData: {},
        serverData: {},
        timestamp: new Date(),
        resolved: false,
      };

      mockIDBManager.get.mockResolvedValue(mockConflict);
      mockConflictResolver.presentConflict.mockResolvedValue('MERGE');
      mockConflictResolver.resolveConflict.mockResolvedValue({ merged: true });

      const result = await conflictManager.autoResolveConflict('conflict-1');

      expect(mockConflictResolver.presentConflict).toHaveBeenCalledWith(
        mockConflict,
      );
      expect(result).toEqual({ merged: true });
    });
  });

  describe('getUnresolvedConflicts', () => {
    it('should return only unresolved conflicts', async () => {
      const conflicts: ConflictData[] = [
        {
          id: '1',
          entityType: 'HABIT',
          entityId: 'habit-1',
          localData: {},
          serverData: {},
          timestamp: new Date(),
          resolved: false,
        },
        {
          id: '2',
          entityType: 'HABIT',
          entityId: 'habit-2',
          localData: {},
          serverData: {},
          timestamp: new Date(),
          resolved: true,
        },
      ];

      mockIDBManager.getAll.mockResolvedValue(conflicts);

      const result = await conflictManager.getUnresolvedConflicts();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('getConflictsByEntity', () => {
    it('should return conflicts for specific entity', async () => {
      const conflicts: ConflictData[] = [
        {
          id: '1',
          entityType: 'HABIT',
          entityId: 'habit-1',
          localData: {},
          serverData: {},
          timestamp: new Date(),
          resolved: false,
        },
        {
          id: '2',
          entityType: 'HABIT_ENTRY',
          entityId: 'entry-1',
          localData: {},
          serverData: {},
          timestamp: new Date(),
          resolved: false,
        },
      ];

      mockIDBManager.getAll.mockResolvedValue(conflicts);

      const result = await conflictManager.getConflictsByEntity(
        'HABIT',
        'habit-1',
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('resolveAllConflicts', () => {
    it('should resolve all unresolved conflicts', async () => {
      const conflicts: ConflictData[] = [
        {
          id: '1',
          entityType: 'HABIT',
          entityId: 'habit-1',
          localData: {},
          serverData: {},
          timestamp: new Date(),
          resolved: false,
        },
        {
          id: '2',
          entityType: 'HABIT',
          entityId: 'habit-2',
          localData: {},
          serverData: {},
          timestamp: new Date(),
          resolved: false,
        },
      ];

      mockIDBManager.getAll.mockResolvedValue(conflicts);
      mockIDBManager.get
        .mockResolvedValueOnce(conflicts[0])
        .mockResolvedValueOnce(conflicts[1]);
      mockConflictResolver.presentConflict
        .mockResolvedValueOnce('LOCAL')
        .mockResolvedValueOnce('SERVER');
      mockConflictResolver.resolveConflict
        .mockResolvedValueOnce({ resolved: 'local' })
        .mockResolvedValueOnce({ resolved: 'server' });

      await conflictManager.resolveAllConflicts();

      expect(mockConflictResolver.presentConflict).toHaveBeenCalledTimes(2);
      expect(mockConflictResolver.resolveConflict).toHaveBeenCalledTimes(2);
    });

    it('should continue resolving even if one fails', async () => {
      const conflicts: ConflictData[] = [
        {
          id: '1',
          entityType: 'HABIT',
          entityId: 'habit-1',
          localData: {},
          serverData: {},
          timestamp: new Date(),
          resolved: false,
        },
        {
          id: '2',
          entityType: 'HABIT',
          entityId: 'habit-2',
          localData: {},
          serverData: {},
          timestamp: new Date(),
          resolved: false,
        },
      ];

      mockIDBManager.getAll.mockResolvedValue(conflicts);
      mockIDBManager.get
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce(conflicts[1]);
      mockConflictResolver.presentConflict.mockResolvedValueOnce('SERVER');
      mockConflictResolver.resolveConflict.mockResolvedValueOnce({
        resolved: 'server',
      });

      // Should not throw error
      await expect(
        conflictManager.resolveAllConflicts(),
      ).resolves.toBeUndefined();
    });
  });

  describe('getConflictStats', () => {
    it('should return accurate conflict statistics', async () => {
      const conflicts: ConflictData[] = [
        {
          id: '1',
          entityType: 'HABIT',
          entityId: 'habit-1',
          localData: {},
          serverData: {},
          timestamp: new Date(),
          resolved: false,
        },
        {
          id: '2',
          entityType: 'HABIT',
          entityId: 'habit-2',
          localData: {},
          serverData: {},
          timestamp: new Date(),
          resolved: true,
          resolution: 'MERGE',
        },
        {
          id: '3',
          entityType: 'HABIT',
          entityId: 'habit-3',
          localData: {},
          serverData: {},
          timestamp: new Date(),
          resolved: true,
          resolution: 'LOCAL',
        },
      ];

      mockIDBManager.getAll.mockResolvedValue(conflicts);

      const stats = await conflictManager.getConflictStats();

      expect(stats.total).toBe(3);
      expect(stats.unresolved).toBe(1);
      expect(stats.autoResolved).toBe(1);
      expect(stats.userResolved).toBe(1);
    });
  });

  describe('cleanupResolvedConflicts', () => {
    it('should delete resolved conflicts older than specified date', async () => {
      const cutoffDate = new Date('2023-01-15');
      const conflicts: ConflictData[] = [
        {
          id: '1',
          entityType: 'HABIT',
          entityId: 'habit-1',
          localData: {},
          serverData: {},
          timestamp: new Date('2023-01-10'), // Older, resolved
          resolved: true,
        },
        {
          id: '2',
          entityType: 'HABIT',
          entityId: 'habit-2',
          localData: {},
          serverData: {},
          timestamp: new Date('2023-01-20'), // Newer, resolved
          resolved: true,
        },
        {
          id: '3',
          entityType: 'HABIT',
          entityId: 'habit-3',
          localData: {},
          serverData: {},
          timestamp: new Date('2023-01-10'), // Older, unresolved
          resolved: false,
        },
      ];

      mockIDBManager.getAll.mockResolvedValue(conflicts);

      await conflictManager.cleanupResolvedConflicts(cutoffDate);

      expect(mockIDBManager.delete).toHaveBeenCalledTimes(1);
      expect(mockIDBManager.delete).toHaveBeenCalledWith('conflicts', '1');
    });
  });
});
