import { axiosInstance } from '@shared/services/api/axiosInstance';
import { Habit } from '@/features/habits/types/Habit';
import { HabitStats } from '@/features/habits/types/HabitStats';
import { ProgressOverview } from '@/features/progress/types/ProgressOverview';

export const fetchHabits = async (
  date?: Date,
  timeZone?: string,
): Promise<Habit[]> => {
  const params =
    date && timeZone ? { date: date.toISOString(), timeZone } : undefined;

  const response = await axiosInstance.get<Habit[]>('/api/v1/habits', {
    params,
  });
  return response.data;
};

export const fetchHabitStats = async (
  habitId: string,
  timeZone: string,
): Promise<HabitStats> => {
  const response = await axiosInstance.get<HabitStats>(
    `/api/v1/habits/${habitId}/stats`,
    {
      params: { timeZone },
    },
  );
  return response.data;
};

export const addHabit = async (
  habitData: Omit<Habit, 'id' | 'completed'>,
): Promise<{ message: string; habitId: string }> => {
  const response = await axiosInstance.post<{
    message: string;
    habitId: string;
  }>('/api/v1/habits', habitData);
  return response.data;
};

export const updateHabit = async (
  habitId: string,
  habitData: Partial<Omit<Habit, 'id' | 'completed'>>,
): Promise<{ message: string; habitId: string }> => {
  const response = await axiosInstance.put<{
    message: string;
    habitId: string;
  }>(`/api/v1/habits/${habitId}`, habitData);
  return response.data;
};

export const deleteHabit = async (
  habitId: string,
): Promise<{ message: string; habitId: string }> => {
  const response = await axiosInstance.delete<{
    message: string;
    habitId: string;
  }>(`/api/v1/habits/${habitId}`);
  return response.data;
};

export const toggleHabitCompletion = async (
  habitId: string,
  date: Date,
  timeZone: string,
): Promise<{ message: string; trackerId?: string }> => {
  const response = await axiosInstance.post<{
    message: string;
    trackerId?: string;
  }>(`/api/v1/habits/${habitId}/trackers`, {
    timestamp: date.toISOString(),
    timeZone,
  });

  return response.data;
};

export const fetchProgressOverview = async (
  date: Date,
  timeZone: string,
): Promise<ProgressOverview> => {
  const response = await axiosInstance.get<ProgressOverview>(
    '/api/v1/habits/progress/overview',
    {
      params: { date: date.toISOString(), timeZone },
    },
  );
  return response.data;
};
