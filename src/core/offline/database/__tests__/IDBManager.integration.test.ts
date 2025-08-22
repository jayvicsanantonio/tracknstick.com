// Integration tests for IDBManager class
// Tests real IndexedDB operations in a browser-like environment

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IDBManager } from '../IDBManager';
import { OfflineHabit, HabitEntry } from '../../types';

// Mock implementations for testing
const mockHabit: OfflineHabit = {
  id: 'habit1',
  localId: 'local_habit1',
  serverId: 'server_habit1',
  name: 'Test Habit',
  description: 'A test habit',
  icon: '📚',
  frequency: 'daily',
  lastModified: new Date('2023-01-01'),
  synced: false,
  version: 1,
  deleted: false,
};

const mockHabitEntry: HabitEntry = {
  id: 'entry1',
  localId: 'local_entry1',
  serverId: 'server_entry1',
  habitId: 'habit1',
  date: new Date('2023-01-01'),
  completed: true,
  value: 1,
  lastModified: new Date('2023-01-01'),
  synced: false,
  version: 1,
  deleted: false,
};

// Use fake-indexeddb for testing
import 'fake-indexeddb/auto';

describe('IDBManager Integration Tests', () => {
  let manager: IDBManager;

  beforeEach(async () => {
    manager = new IDBManager();
    await manager.initialize();
  });

  afterEach(() => {
    manager.close();
  });

  describe('Habit operations', () => {
    it('should create and retrieve a habit', async () => {
      const putResult = await manager.put('habits', mockHabit);
      expect(putResult).toBe('habit1');

      const retrievedHabit = await manager.get<OfflineHabit>(
        'habits',
        'habit1',
      );
      expect(retrievedHabit).toEqual(mockHabit);
    });

    it('should update an existing habit', async () => {
      await manager.put('habits', mockHabit);

      const updatedHabit = {
        ...mockHabit,
        name: 'Updated Test Habit',
        version: 2,
        lastModified: new Date('2023-01-02'),
      };

      await manager.put('habits', updatedHabit);

      const retrievedHabit = await manager.get<OfflineHabit>(
        'habits',
        'habit1',
      );
      expect(retrievedHabit?.name).toBe('Updated Test Habit');
      expect(retrievedHabit?.version).toBe(2);
    });

    it('should delete a habit', async () => {
      await manager.put('habits', mockHabit);

      let retrievedHabit = await manager.get<OfflineHabit>('habits', 'habit1');
      expect(retrievedHabit).toBeDefined();

      await manager.delete('habits', 'habit1');

      retrievedHabit = await manager.get<OfflineHabit>('habits', 'habit1');
      expect(retrievedHabit).toBeUndefined();
    });

    it('should get all habits', async () => {
      const habit2 = { ...mockHabit, id: 'habit2', localId: 'local_habit2' };
      const habit3 = { ...mockHabit, id: 'habit3', localId: 'local_habit3' };

      await manager.put('habits', mockHabit);
      await manager.put('habits', habit2);
      await manager.put('habits', habit3);

      const allHabits = await manager.getAll<OfflineHabit>('habits');
      expect(allHabits).toHaveLength(3);
      expect(allHabits.map((h) => h.id)).toContain('habit1');
      expect(allHabits.map((h) => h.id)).toContain('habit2');
      expect(allHabits.map((h) => h.id)).toContain('habit3');
    });

    it('should clear all habits', async () => {
      // Start fresh
      await manager.clear('habits');

      await manager.put('habits', mockHabit);
      await manager.put('habits', { ...mockHabit, id: 'habit2' });

      let allHabits = await manager.getAll<OfflineHabit>('habits');
      expect(allHabits).toHaveLength(2);

      await manager.clear('habits');

      allHabits = await manager.getAll<OfflineHabit>('habits');
      expect(allHabits).toHaveLength(0);
    });
  });

  describe('Habit entry operations', () => {
    beforeEach(async () => {
      // Ensure habit exists for entries
      await manager.put('habits', mockHabit);
    });

    it('should create and retrieve a habit entry', async () => {
      const putResult = await manager.put('habitEntries', mockHabitEntry);
      expect(putResult).toBe('entry1');

      const retrievedEntry = await manager.get<HabitEntry>(
        'habitEntries',
        'entry1',
      );
      expect(retrievedEntry).toEqual(mockHabitEntry);
    });

    it('should get entries by habit ID', async () => {
      const entry2 = {
        ...mockHabitEntry,
        id: 'entry2',
        date: new Date('2023-01-02'),
      };
      const entry3 = {
        ...mockHabitEntry,
        id: 'entry3',
        habitId: 'habit2',
        date: new Date('2023-01-03'),
      };

      await manager.put('habitEntries', mockHabitEntry);
      await manager.put('habitEntries', entry2);
      await manager.put('habitEntries', entry3);

      const habit1Entries = await manager.getByIndex<HabitEntry>(
        'habitEntries',
        'habitId',
        'habit1',
      );
      expect(habit1Entries).toHaveLength(2);
      expect(habit1Entries.every((e) => e.habitId === 'habit1')).toBe(true);
    });

    it('should get entries by date range', async () => {
      const entries = [
        { ...mockHabitEntry, id: 'entry1', date: new Date('2023-01-01') },
        { ...mockHabitEntry, id: 'entry2', date: new Date('2023-01-15') },
        { ...mockHabitEntry, id: 'entry3', date: new Date('2023-01-31') },
        { ...mockHabitEntry, id: 'entry4', date: new Date('2023-02-01') },
      ];

      for (const entry of entries) {
        await manager.put('habitEntries', entry);
      }

      const januaryEntries = await manager.getByDateRange<HabitEntry>(
        'habitEntries',
        'date',
        new Date('2023-01-01'),
        new Date('2023-01-31'),
      );

      expect(januaryEntries).toHaveLength(3);
      januaryEntries.forEach((entry) => {
        expect(entry.date.getMonth()).toBe(0); // January is month 0
        expect(entry.date.getFullYear()).toBe(2023);
      });
    });
  });

  describe('Bulk operations', () => {
    it('should put many habits at once', async () => {
      // Clear any existing data first
      await manager.clear('habits');

      const habits = [
        { ...mockHabit, id: 'habit1', name: 'Habit 1' },
        { ...mockHabit, id: 'habit2', name: 'Habit 2' },
        { ...mockHabit, id: 'habit3', name: 'Habit 3' },
      ];

      const results = await manager.putMany('habits', habits);
      expect(results).toEqual(['habit1', 'habit2', 'habit3']);

      const allHabits = await manager.getAll<OfflineHabit>('habits');
      expect(allHabits).toHaveLength(3);
    });

    it('should delete many habits at once', async () => {
      const habits = [
        { ...mockHabit, id: 'habit1', name: 'Habit 1' },
        { ...mockHabit, id: 'habit2', name: 'Habit 2' },
        { ...mockHabit, id: 'habit3', name: 'Habit 3' },
      ];

      await manager.putMany('habits', habits);

      let allHabits = await manager.getAll<OfflineHabit>('habits');
      expect(allHabits).toHaveLength(3);

      await manager.deleteMany('habits', ['habit1', 'habit3']);

      allHabits = await manager.getAll<OfflineHabit>('habits');
      expect(allHabits).toHaveLength(1);
      expect(allHabits[0].id).toBe('habit2');
    });

    it('should handle empty arrays in bulk operations', async () => {
      const putResults = await manager.putMany('habits', []);
      expect(putResults).toEqual([]);

      await manager.deleteMany('habits', []);
      // Should not throw any errors
    });
  });

  describe('Counting and indexing', () => {
    beforeEach(async () => {
      // Clear any existing data first
      await manager.clear('habits');

      const habits = [
        { ...mockHabit, id: 'habit1', synced: true },
        { ...mockHabit, id: 'habit2', synced: false },
        { ...mockHabit, id: 'habit3', synced: false },
      ];

      await manager.putMany('habits', habits);
    });

    it('should count all items in store', async () => {
      const count = await manager.count('habits');
      expect(count).toBe(3);
    });

    it('should count items by index value', async () => {
      const syncedCount = await manager.count('habits', 'synced', true);
      expect(syncedCount).toBe(1);

      const unsyncedCount = await manager.count('habits', 'synced', false);
      expect(unsyncedCount).toBe(2);
    });

    it('should get unsynced habits using index', async () => {
      const unsyncedHabits = await manager.getByIndex<OfflineHabit>(
        'habits',
        'synced',
        false,
      );
      expect(unsyncedHabits).toHaveLength(2);
      expect(unsyncedHabits.every((h) => h.synced === false)).toBe(true);
    });
  });

  describe('Transaction handling', () => {
    beforeEach(async () => {
      // Clear any existing data first
      await manager.clear('habits');
    });

    it('should handle custom transactions', async () => {
      const result = await manager.transaction(
        ['habits'],
        'readwrite',
        async (transaction) => {
          const store = transaction.objectStore('habits');

          // Put multiple items in a single transaction
          store.put({ ...mockHabit, id: 'habit1' });
          store.put({ ...mockHabit, id: 'habit2' });

          return 'transaction-complete';
        },
      );

      expect(result).toBe('transaction-complete');

      const allHabits = await manager.getAll<OfflineHabit>('habits');
      expect(allHabits).toHaveLength(2);
    });

    it('should rollback transaction on error', async () => {
      await expect(
        manager.transaction(['habits'], 'readwrite', async () => {
          throw new Error('Intentional error');
        }),
      ).rejects.toThrow('Intentional error');

      // Verify no changes were made
      const allHabits = await manager.getAll<OfflineHabit>('habits');
      expect(allHabits).toHaveLength(0);
    });
  });

  describe('Cross-store operations', () => {
    it('should work across multiple stores in a transaction', async () => {
      await manager.transaction(
        ['habits', 'habitEntries'],
        'readwrite',
        async (transaction) => {
          const habitStore = transaction.objectStore('habits');
          const entryStore = transaction.objectStore('habitEntries');

          habitStore.put(mockHabit);
          entryStore.put(mockHabitEntry);

          return 'cross-store-complete';
        },
      );

      const habit = await manager.get<OfflineHabit>('habits', 'habit1');
      const entry = await manager.get<HabitEntry>('habitEntries', 'entry1');

      expect(habit).toBeDefined();
      expect(entry).toBeDefined();
      expect(entry?.habitId).toBe(habit?.id);
    });
  });

  describe('Data consistency', () => {
    it('should maintain data integrity across operations', async () => {
      // Create habit and multiple entries
      await manager.put('habits', mockHabit);

      const entries = Array.from({ length: 5 }, (_, i) => ({
        ...mockHabitEntry,
        id: `entry${i + 1}`,
        date: new Date(2023, 0, i + 1), // January 1-5, 2023
      }));

      await manager.putMany('habitEntries', entries);

      // Verify all entries reference the correct habit
      const allEntries = await manager.getByIndex<HabitEntry>(
        'habitEntries',
        'habitId',
        'habit1',
      );
      expect(allEntries).toHaveLength(5);
      expect(allEntries.every((e) => e.habitId === 'habit1')).toBe(true);

      // Delete habit (in real app, this would cascade delete entries)
      await manager.delete('habits', 'habit1');

      // Entries should still exist (demonstrating referential integrity handling needed)
      const remainingEntries = await manager.getAll<HabitEntry>('habitEntries');
      expect(remainingEntries).toHaveLength(5);
    });
  });
});
