// Unit tests for ConflictResolver class
// Tests conflict detection, resolution strategies, and data merging logic

import { ConflictResolver } from '../ConflictResolver';
import { ConflictData, OfflineHabit, HabitEntry } from '../../types';

describe('ConflictResolver', () => {
  let resolver: ConflictResolver;

  beforeEach(() => {
    resolver = new ConflictResolver();
  });

  describe('detectConflicts', () => {
    it('should return false when either data is null or undefined', () => {
      expect(resolver.detectConflicts(null, { version: 1 })).toBe(false);
      expect(resolver.detectConflicts({ version: 1 }, null)).toBe(false);
      expect(resolver.detectConflicts(undefined, { version: 1 })).toBe(false);
    });

    it('should return false when lastModified is missing', () => {
      const local = { version: 1 };
      const server = { version: 2, lastModified: new Date() };
      expect(resolver.detectConflicts(local, server)).toBe(false);
    });

    it('should detect conflicts based on version numbers', () => {
      const baseDate = new Date();
      const local = { version: 1, lastModified: baseDate };
      const server = { version: 2, lastModified: baseDate };

      expect(resolver.detectConflicts(local, server)).toBe(true);
    });

    it('should detect conflicts based on lastModified timestamps', () => {
      const local = { lastModified: new Date('2023-01-01') };
      const server = { lastModified: new Date('2023-01-02') };

      expect(resolver.detectConflicts(local, server)).toBe(true);
    });

    it('should return false when data is identical', () => {
      const date = new Date();
      const local = { version: 1, lastModified: date };
      const server = { version: 1, lastModified: date };

      expect(resolver.detectConflicts(local, server)).toBe(false);
    });
  });

  describe('resolveConflict', () => {
    const mockConflict: ConflictData = {
      id: 'conflict-1',
      entityType: 'HABIT',
      entityId: 'habit-1',
      localData: { id: 'habit-1', name: 'Local Habit', version: 1 },
      serverData: { id: 'habit-1', name: 'Server Habit', version: 2 },
      timestamp: new Date(),
      resolved: false,
    };

    it('should return local data for LOCAL resolution', async () => {
      const result = await resolver.resolveConflict(mockConflict, 'LOCAL');
      expect(result).toBe(mockConflict.localData);
    });

    it('should return server data for SERVER resolution', async () => {
      const result = await resolver.resolveConflict(mockConflict, 'SERVER');
      expect(result).toBe(mockConflict.serverData);
    });

    it('should merge data for MERGE resolution', async () => {
      const result = await resolver.resolveConflict(mockConflict, 'MERGE');
      expect(result).not.toBe(mockConflict.localData);
      expect(result).not.toBe(mockConflict.serverData);
    });

    it('should throw error for unknown resolution strategy', async () => {
      await expect(
        resolver.resolveConflict(mockConflict, 'UNKNOWN' as any),
      ).rejects.toThrow('Unknown resolution strategy: UNKNOWN');
    });
  });

  describe('mergeData', () => {
    it('should return server data when local is null', () => {
      const server = { id: '1', version: 1 };
      expect(resolver.mergeData(null, server)).toBe(server);
    });

    it('should return local data when server is null', () => {
      const local = { id: '1', version: 1 };
      expect(resolver.mergeData(local, null)).toBe(local);
    });

    it('should merge habit data intelligently', () => {
      const local: OfflineHabit = {
        id: 'habit-1',
        name: 'Local Name',
        description: 'Local Description',
        color: '#ff0000',
        userId: 'user-1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-03'),
        lastModified: new Date('2023-01-03'),
        version: 1,
        synced: false,
      };

      const server: OfflineHabit = {
        id: 'habit-1',
        name: 'Server Name',
        description: 'Server Description',
        color: '#00ff00',
        userId: 'user-1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        lastModified: new Date('2023-01-02'),
        version: 2,
        synced: true,
      };

      const merged = resolver.mergeData(local, server) as OfflineHabit;

      expect(merged.name).toBe('Local Name'); // Local is newer
      expect(merged.description).toBe('Local Description');
      expect(merged.color).toBe('#ff0000');
      expect(merged.version).toBe(3); // Max version + 1
      expect(merged.synced).toBe(false); // Always false after merge
    });

    it('should merge habit entry data intelligently', () => {
      const local: HabitEntry = {
        id: 'entry-1',
        habitId: 'habit-1',
        date: new Date('2023-01-01'),
        completed: true,
        lastModified: new Date('2023-01-03'),
        version: 1,
        synced: false,
      };

      const server: HabitEntry = {
        id: 'entry-1',
        habitId: 'habit-1',
        date: new Date('2023-01-01'),
        completed: false,
        lastModified: new Date('2023-01-02'),
        version: 2,
        synced: true,
      };

      const merged = resolver.mergeData(local, server) as HabitEntry;

      expect(merged.completed).toBe(true); // Local is newer
      expect(merged.version).toBe(3); // Max version + 1
      expect(merged.synced).toBe(false); // Always false after merge
    });

    it('should handle generic entity merging', () => {
      const local = {
        id: '1',
        lastModified: new Date('2023-01-03'),
        version: 1,
        synced: true,
      };

      const server = {
        id: '1',
        lastModified: new Date('2023-01-02'),
        version: 2,
        synced: true,
      };

      const merged = resolver.mergeData(local, server) as any;

      expect(merged.version).toBe(3); // Max version + 1
      expect(merged.synced).toBe(false); // Always false after merge
      expect(merged.lastModified).toBeInstanceOf(Date);
    });
  });

  describe('presentConflict', () => {
    it('should prefer LOCAL when local is deleted and server is not', async () => {
      const conflict: ConflictData = {
        id: 'conflict-1',
        entityType: 'HABIT',
        entityId: 'habit-1',
        localData: { deleted: true, lastModified: new Date() },
        serverData: { deleted: false, lastModified: new Date() },
        timestamp: new Date(),
        resolved: false,
      };

      const resolution = await resolver.presentConflict(conflict);
      expect(resolution).toBe('LOCAL');
    });

    it('should prefer SERVER when server is deleted and local is not', async () => {
      const conflict: ConflictData = {
        id: 'conflict-1',
        entityType: 'HABIT',
        entityId: 'habit-1',
        localData: { deleted: false, lastModified: new Date() },
        serverData: { deleted: true, lastModified: new Date() },
        timestamp: new Date(),
        resolved: false,
      };

      const resolution = await resolver.presentConflict(conflict);
      expect(resolution).toBe('SERVER');
    });

    it('should prefer SERVER when both are deleted', async () => {
      const conflict: ConflictData = {
        id: 'conflict-1',
        entityType: 'HABIT',
        entityId: 'habit-1',
        localData: { deleted: true, lastModified: new Date() },
        serverData: { deleted: true, lastModified: new Date() },
        timestamp: new Date(),
        resolved: false,
      };

      const resolution = await resolver.presentConflict(conflict);
      expect(resolution).toBe('SERVER');
    });

    it('should prefer MERGE for non-deletion conflicts', async () => {
      const conflict: ConflictData = {
        id: 'conflict-1',
        entityType: 'HABIT',
        entityId: 'habit-1',
        localData: { deleted: false, lastModified: new Date() },
        serverData: { deleted: false, lastModified: new Date() },
        timestamp: new Date(),
        resolved: false,
      };

      const resolution = await resolver.presentConflict(conflict);
      expect(resolution).toBe('MERGE');
    });
  });
});
