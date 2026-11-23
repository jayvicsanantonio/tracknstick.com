// Habit completions changed while the API could not be reached, kept on the device until it can.
// Each names the outcome the user wants, so the API can be sent it twice, or late, and stay right.

import axios from 'axios';
import { toggleHabitCompletion } from './index';

/** A habit's completion on one day, as the user left it. */
export interface PendingCompletion {
  /** The user who made the change; only they may send it. */
  userId: string;
  habitId: string;
  /** The day's midnight in `timeZone`; one change per habit and day. */
  day: string;
  /** When the change was made, which the API reads the day from. */
  timestamp: string;
  timeZone: string;
  completed: boolean;
}

const STORAGE_KEY = 'track-n-stick-pending-completions';
const EMPTY: PendingCompletion[] = [];

const listeners = new Set<() => void>();

// The parsed list, kept with the text it came from, so that reading the same
// text again returns the same array, as useSyncExternalStore requires.
let cached: { raw: string | null; changes: PendingCompletion[] } = {
  raw: null,
  changes: EMPTY,
};

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** The changes not yet saved by the API, oldest first. */
export function pendingCompletions(): PendingCompletion[] {
  const raw = readRaw();
  if (raw === cached.raw) return cached.changes;

  let changes = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : EMPTY;
    if (Array.isArray(parsed)) changes = parsed as PendingCompletion[];
  } catch {
    // Unreadable: start again with none.
  }
  cached = { raw, changes };
  return changes;
}

function write(changes: PendingCompletion[]) {
  try {
    if (changes.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
  } catch {
    // Storage is full or blocked: the change lives only on screen.
  }
  listeners.forEach((listener) => listener());
}

const sameDay = (a: PendingCompletion, b: PendingCompletion) =>
  a.userId === b.userId && a.habitId === b.habitId && a.day === b.day;

/** Keeps a change, in place of any earlier one to the same habit and day. */
export function queueCompletion(change: PendingCompletion): void {
  write([...pendingCompletions().filter((c) => !sameDay(c, change)), change]);
}

/**
 * Forgets a change once the API has saved it, unless the user has changed
 * that habit and day again since, to another outcome still to be sent.
 */
export function removeCompletion(change: PendingCompletion): void {
  write(
    pendingCompletions().filter(
      (c) => !(sameDay(c, change) && c.completed === change.completed),
    ),
  );
}

export function subscribeToPendingCompletions(
  listener: () => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** True when the request reached no server: the connection got nowhere. */
export const isUnreachable = (error: unknown) =>
  axios.isAxiosError(error) && !error.response;

/**
 * Sends the signed-in user's changes to the API in the order they were made,
 * and forgets each one it saves. Another user's changes are dropped unsent.
 * Stops at the first that reaches no server, leaving it and the rest for the
 * next try. A change the API refuses (a 4xx, such as for a deleted habit) is
 * dropped; one it fails to save (a 5xx) is kept for the next try.
 */
export async function sendPendingCompletions(userId: string): Promise<void> {
  for (const change of pendingCompletions()) {
    if (change.userId !== userId) {
      removeCompletion(change);
      continue;
    }

    try {
      await toggleHabitCompletion(
        change.habitId,
        new Date(change.timestamp),
        change.timeZone,
        change.completed,
      );
      removeCompletion(change);
    } catch (error) {
      if (isUnreachable(error)) return;
      const status = axios.isAxiosError(error) ? error.response?.status : 0;
      if (status && status >= 400 && status < 500) {
        console.error('Dropped a habit change the API refused:', error);
        removeCompletion(change);
      }
    }
  }
}
