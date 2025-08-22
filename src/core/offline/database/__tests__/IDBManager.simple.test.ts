// Simple unit tests for IDBManager class functionality
// Tests basic operations without complex mock interactions

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IDBManager } from '../IDBManager';
import 'fake-indexeddb/auto';

describe('IDBManager Simple Tests', () => {
  let manager: IDBManager;

  beforeEach(async () => {
    manager = new IDBManager();
    await manager.initialize();
  });

  afterEach(() => {
    manager.close();
  });

  it('should initialize successfully', async () => {
    const newManager = new IDBManager();
    await expect(newManager.initialize()).resolves.not.toThrow();
    newManager.close();
  });

  it('should throw error when not initialized', async () => {
    const uninitializedManager = new IDBManager();
    await expect(uninitializedManager.get('habits', '1')).rejects.toThrow(
      'Database not initialized',
    );
  });

  it('should handle basic CRUD operations', async () => {
    const testHabit = {
      id: 'habit1',
      name: 'Test Habit',
      synced: false,
    };

    // Create
    const putResult = await manager.put('habits', testHabit);
    expect(putResult).toBe('habit1');

    // Read
    const retrievedHabit = await manager.get('habits', 'habit1');
    expect(retrievedHabit).toEqual(testHabit);

    // Update
    const updatedHabit = { ...testHabit, name: 'Updated Habit' };
    await manager.put('habits', updatedHabit);
    const retrievedUpdated = await manager.get('habits', 'habit1');
    expect(retrievedUpdated?.name).toBe('Updated Habit');

    // Delete
    await manager.delete('habits', 'habit1');
    const deletedHabit = await manager.get('habits', 'habit1');
    expect(deletedHabit).toBeUndefined();
  });

  it('should handle bulk operations', async () => {
    const habits = [
      { id: 'habit1', name: 'Habit 1' },
      { id: 'habit2', name: 'Habit 2' },
      { id: 'habit3', name: 'Habit 3' },
    ];

    const results = await manager.putMany('habits', habits);
    expect(results).toEqual(['habit1', 'habit2', 'habit3']);

    const allHabits = await manager.getAll('habits');
    expect(allHabits).toHaveLength(3);

    await manager.deleteMany('habits', ['habit1', 'habit3']);
    const remainingHabits = await manager.getAll('habits');
    expect(remainingHabits).toHaveLength(1);
    expect(remainingHabits[0].id).toBe('habit2');
  });

  it('should handle empty bulk operations', async () => {
    const putResults = await manager.putMany('habits', []);
    expect(putResults).toEqual([]);

    await manager.deleteMany('habits', []);
    // Should not throw
  });

  it('should count items correctly', async () => {
    // Clear any existing data first
    await manager.clear('habits');
    expect(await manager.count('habits')).toBe(0);

    await manager.put('habits', { id: 'habit1', synced: true });
    await manager.put('habits', { id: 'habit2', synced: false });

    expect(await manager.count('habits')).toBe(2);
  });

  it('should clear store', async () => {
    await manager.put('habits', { id: 'habit1' });
    await manager.put('habits', { id: 'habit2' });

    expect(await manager.count('habits')).toBe(2);

    await manager.clear('habits');
    expect(await manager.count('habits')).toBe(0);
  });

  it('should handle database closure', () => {
    manager.close();
    expect(() => manager.close()).not.toThrow(); // Should handle multiple closes
  });
});
