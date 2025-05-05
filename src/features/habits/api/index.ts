import axiosInstance from "@/services/api/axiosInstance";
import { Habit } from "@/features/habits/types/Habit";

export const fetchHabits = async (
  date: Date,
  timeZone: string,
): Promise<Habit[]> => {
  const response = await axiosInstance.get<Habit[]>("/api/v1/habits", {
    params: { date: date.toISOString(), timeZone },
  });
  return response.data;
};

export const addHabit = async (
  habitData: Omit<Habit, "id" | "completed" | "stats">,
): Promise<{ message: string; habitId: string }> => {
  const response = await axiosInstance.post<{
    message: string;
    habitId: string;
  }>("/api/v1/habits", habitData);
  return response.data;
};

export const updateHabit = async (
  habitId: string,
  habitData: Partial<Omit<Habit, "id" | "completed" | "stats">>,
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
