// Unit tests for HabitCompletionService
// Tests habit completion calculation, streak counting, and entry conflict detection

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HabitCompletionService } from '../HabitCompletionService';
import { IDBManager } from '../../database/IDBManager';
import { OfflineHabit, HabitEntry } from '../../types';

// Mock IDBManager
vi.mock('../../database/IDBManager');

describe('HabitCompletionService', () => {
  let habitCompletionService: HabitCompletionService;
  let mockDBManager: vi.Mocked<IDBManager>;

  const mockHabits: OfflineHabit[] = [
    {
      id: 'habit-1',
      name: 'Exercise',
      icon: 'dumbbell',
      frequency: [1, 2, 3, 4, 5], // Weekdays
      startDate: new Date('2024-01-01'),
      lastModified: new Date('2024-01-01'),
      synced: true,
      version: 1,
    },
    {
      id: 'habit-2',
      name: 'Read',
      icon: 'book',
      frequency: [0, 6], // Weekends
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      lastModified: new Date('2024-01-01'),
      synced: true,
      version: 1,
    },
  ];

  const mockEntries: HabitEntry[] = [
    {
      id: 'habit-1_2024-01-01',
      habitId: 'habit-1',
      date: new Date('2024-01-01'), // Monday
      completed: true,
      lastModified: new Date('2024-01-01'),
      synced: true,
      version: 1,
    },
    {
      id: 'habit-2_2024-01-06',
      habitId: 'habit-2',
      date: new Date('2024-01-06'), // Saturday
      completed: true,
      lastModified: new Date('2024-01-06'),
      synced: true,
      version: 1,
    },
  ];

  beforeEach(() => {
    mockDBManager = {
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

    habitCompletionService = new HabitCompletionService(mockDBManager);
  });

  describe('getHabitsWithCompletion', () => {
    it('should calculate completion status for habits on a given date', async () => {
      const testDate = new Date('2024-01-01'); // Monday
      mockDBManager.getByIndex.mockResolvedValue(mockEntries);

      const result = await habitCompletionService.getHabitsWithCompletion(
        mockHabits,
        testDate,
      );

      expect(mockDBManager.getByIndex).toHaveBeenCalledWith(
        'habitEntries',
        'date',
        testDate,
      );
      expect(result).toHaveLength(1); // Only habit-1 is scheduled for Monday
      expect(result[0]).toEqual({
        ...mockHabits[0],
        completed: true,
        completionDate: mockEntries[0].date,
      });
    });

    it('should return only active habits for the date', async () => {
      const testDate = new Date('2024-01-06'); // Saturday
      mockDBManager.getByIndex.mockResolvedValue(mockEntries);

      const result = await habitCompletionService.getHabitsWithCompletion(
        mockHabits,
        testDate,
      );

      expect(result).toHaveLength(1); // Only habit-2 is scheduled for Saturday
      expect(result[0].id).toBe('habit-2');
      expect(result[0].completed).toBe(true);
    });

    it('should filter out deleted habits', async () => {
      const habitsWithDeleted = [
        ...mockHabits,
        { ...mockHabits[0], id: 'habit-3', deleted: true },
      ];
      const testDate = new Date('2024-01-01');
      mockDBManager.getByIndex.mockResolvedValue([]);

      const result = await habitCompletionService.getHabitsWithCompletion(
        habitsWithDeleted,
        testDate,
      );

      expect(result).toHaveLength(1); // Deleted habit should be filtered out
      expect(result[0].id).toBe('habit-1');
    });

    it('should handle habits outside their active date range', async () => {
      const testDate = new Date('2024-02-01'); // After habit-2's end date
      mockDBManager.getByIndex.mockResolvedValue([]);

      const result = await habitCompletionService.getHabitsWithCompletion(
        mockHabits,
        testDate,
      );

      expect(result).toHaveLength(1); // Only habit-1 should be active (no end date)
      expect(result[0].id).toBe('habit-1');
      expect(result[0].completed).toBe(false); // No entry for this date
    });
  });

  describe('getHabitCompletion', () => {
    it('should get completion status for specific habit and date', async () => {
      const habitId = 'habit-1';
      const date = new Date('2024-01-01');
      mockDBManager.get.mockResolvedValue(mockEntries[0]);

      const result = await habitCompletionService.getHabitCompletion(
        habitId,
        date,
      );

      expect(mockDBManager.get).toHaveBeenCalledWith(
        'habitEntries',
        'habit-1_2024-01-01',
      );
      expect(result).toEqual({
        completed: true,
        entry: mockEntries[0],
      });
    });

    it('should return false for non-existent entry', async () => {
      mockDBManager.get.mockResolvedValue(undefined);

      const result = await habitCompletionService.getHabitCompletion(
        'habit-1',
        new Date('2024-01-02'),
      );

      expect(result).toEqual({
        completed: false,
        entry: undefined,
      });
    });

    it('should ignore deleted entries', async () => {
      const deletedEntry = { ...mockEntries[0], deleted: true };
      mockDBManager.get.mockResolvedValue(deletedEntry);

      const result = await habitCompletionService.getHabitCompletion(
        'habit-1',
        new Date('2024-01-01'),
      );

      expect(result).toEqual({
        completed: false,
        entry: undefined,
      });
    });
  });

  describe('getCompletionStats', () => {
    it('should calculate completion statistics for date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');
      mockDBManager.getByDateRange.mockResolvedValue(mockEntries);

      const result = await habitCompletionService.getCompletionStats(
        mockHabits,
        startDate,
        endDate,
      );

      expect(mockDBManager.getByDateRange).toHaveBeenCalledWith(
        'habitEntries',
        'date',
        startDate,
        endDate,
      );
      expect(result.totalHabits).toBe(2);
      expect(result.completedHabits).toBe(2);
      expect(result.completionRate).toBeGreaterThan(0);
      expect(result.lastCompletionDate).toEqual(mockEntries[1].date);
    });

    it('should return zero stats for no habits', async () => {
      const result = await habitCompletionService.getCompletionStats(
        [],
        new Date(),
        new Date(),
      );

      expect(result).toEqual({
        totalHabits: 0,
        completedHabits: 0,
        completionRate: 0,
        streakCount: 0,
      });
    });

    it('should filter out incomplete entries', async () => {
      const entriesWithIncomplete = [
        ...mockEntries,
        {
          id: 'habit-1_2024-01-02',
          habitId: 'habit-1',
          date: new Date('2024-01-02'),
          completed: false, // Incomplete
          lastModified: new Date('2024-01-02'),
          synced: true,
          version: 1,
        },
      ];
      mockDBManager.getByDateRange.mockResolvedValue(entriesWithIncomplete);

      const result = await habitCompletionService.getCompletionStats(
        mockHabits,
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );

      expect(result.completedHabits).toBe(2); // Only completed entries counted
    });
  });

  describe('calculateCurrentStreak', () => {
    it('should calculate streak correctly', async () => {
      // Mock the getHabitsWithCompletion method
      const service = habitCompletionService as any;
      service.getHabitsWithCompletion = vi
        .fn()
        .mockResolvedValueOnce([{ ...mockHabits[0], completed: true }]) // Today
        .mockResolvedValueOnce([{ ...mockHabits[0], completed: true }]) // Yesterday
        .mockResolvedValueOnce([{ ...mockHabits[0], completed: false }]); // Day before

      const result = await habitCompletionService.calculateCurrentStreak(
        mockHabits,
        new Date('2024-01-03'),
      );

      expect(result).toBe(2); // 2-day streak
    });

    it('should return 0 for broken streak', async () => {
      const service = habitCompletionService as any;
      service.getHabitsWithCompletion = vi
        .fn()
        .mockResolvedValueOnce([{ ...mockHabits[0], completed: false }]); // Today incomplete

      const result = await habitCompletionService.calculateCurrentStreak(
        mockHabits,
        new Date('2024-01-01'),
      );

      expect(result).toBe(0);
    });

    it('should handle no active habits', async () => {
      const result = await habitCompletionService.calculateCurrentStreak(
        [],
        new Date(),
      );

      expect(result).toBe(0);
    });
  });

  describe('getDailyCompletionSummary', () => {
    it('should provide daily completion summary', async () => {
      const dates = [new Date('2024-01-01'), new Date('2024-01-06')];
      const service = habitCompletionService as any;
      service.getHabitsWithCompletion = vi
        .fn()
        .mockResolvedValueOnce([{ ...mockHabits[0], completed: true }]) // Monday
        .mockResolvedValueOnce([{ ...mockHabits[1], completed: true }]); // Saturday

      const result = await habitCompletionService.getDailyCompletionSummary(
        mockHabits,
        dates,
      );

      expect(result.size).toBe(2);
      expect(result.get('2024-01-01')).toEqual({
        completed: 1,
        total: 1,
        rate: 100,
      });
      expect(result.get('2024-01-06')).toEqual({
        completed: 1,
        total: 1,
        rate: 100,
      });
    });

    it('should handle mixed completion rates', async () => {
      const dates = [new Date('2024-01-01')];
      const service = habitCompletionService as any;
      service.getHabitsWithCompletion = vi.fn().mockResolvedValueOnce([
        { ...mockHabits[0], completed: true },
        { ...mockHabits[1], completed: false },
      ]);

      const result = await habitCompletionService.getDailyCompletionSummary(
        [mockHabits[0], mockHabits[1]],
        dates,
      );

      expect(result.get('2024-01-01')).toEqual({
        completed: 1,
        total: 2,
        rate: 50,
      });
    });
  });

  describe('detectEntryConflicts', () => {
    it('should detect conflicting entries for same habit and date', async () => {
      const conflictingEntries = [
        mockEntries[0],
        { ...mockEntries[0], id: 'habit-1_2024-01-01_conflict', version: 2 },
      ];
      mockDBManager.getByIndex.mockResolvedValue(conflictingEntries);

      const result = await habitCompletionService.detectEntryConflicts(
        'habit-1',
        new Date('2024-01-01'),
      );

      expect(mockDBManager.getByIndex).toHaveBeenCalledWith(
        'habitEntries',
        'habitId_date',
        ['habit-1', new Date('2024-01-01T00:00:00.000Z')],
      );
      expect(result).toEqual(conflictingEntries);
    });

    it('should return empty array for no conflicts', async () => {
      mockDBManager.getByIndex.mockResolvedValue([mockEntries[0]]);

      const result = await habitCompletionService.detectEntryConflicts(
        'habit-1',
        new Date('2024-01-01'),
      );

      expect(result).toEqual([]);
    });

    it('should return empty array for no entries', async () => {
      mockDBManager.getByIndex.mockResolvedValue([]);

      const result = await habitCompletionService.detectEntryConflicts(
        'habit-1',
        new Date('2024-01-01'),
      );

      expect(result).toEqual([]);
    });
  });

  describe('date handling', () => {
    it('should normalize dates correctly', async () => {
      const dateWithTime = new Date('2024-01-01T15:30:45.123Z');
      mockDBManager.getByIndex.mockResolvedValue([]);

      await habitCompletionService.getHabitsWithCompletion(
        mockHabits,
        dateWithTime,
      );

      const expectedNormalizedDate = new Date('2024-01-01T00:00:00.000Z');
      expect(mockDBManager.getByIndex).toHaveBeenCalledWith(
        'habitEntries',
        'date',
        expectedNormalizedDate,
      );
    });

    it('should handle different timezones consistently', async () => {
      const date1 = new Date('2024-01-01T23:00:00.000Z');
      const date2 = new Date('2024-01-01T01:00:00.000Z');
      mockDBManager.getByIndex.mockResolvedValue([]);

      await habitCompletionService.getHabitsWithCompletion(mockHabits, date1);
      await habitCompletionService.getHabitsWithCompletion(mockHabits, date2);

      const expectedDate = new Date('2024-01-01T00:00:00.000Z');
      expect(mockDBManager.getByIndex).toHaveBeenCalledWith(
        'habitEntries',
        'date',
        expectedDate,
      );
      expect(mockDBManager.getByIndex).toHaveBeenCalledTimes(2);
      expect(mockDBManager.getByIndex).toHaveBeenNthCalledWith(
        1,
        'habitEntries',
        'date',
        expectedDate,
      );
      expect(mockDBManager.getByIndex).toHaveBeenNthCalledWith(
        2,
        'habitEntries',
        'date',
        expectedDate,
      );
    });
  });
});
