// Finds the achievements earned since the user last opened the Progress page, to mark them new.
// What has been seen is kept on this device per user; a first visit, or blocked storage, marks nothing new.

import { useEffect, useState } from 'react';
import type { Achievement } from '../types/Achievement';

const STORAGE_KEY_PREFIX = 'track-n-stick-seen-achievements';

const NONE: ReadonlySet<string> = new Set();

function readSeen(key: string): string[] | null {
  const stored = localStorage.getItem(key);
  if (stored === null) return null;
  const parsed: unknown = JSON.parse(stored);
  return Array.isArray(parsed)
    ? parsed.filter((id): id is string => typeof id === 'string')
    : null;
}

/**
 * The ids of earned achievements the user has not seen on the Progress page
 * before. Worked out once per visit, when the achievements and the user are
 * known; everything earned is then remembered as seen, so the marks last for
 * this visit only.
 */
export function useNewAchievements(
  achievements: Achievement[],
  userId: string | null | undefined,
): ReadonlySet<string> {
  const [newIds, setNewIds] = useState<ReadonlySet<string> | null>(null);

  useEffect(() => {
    if (newIds !== null || !userId || achievements.length === 0) return;

    const key = `${STORAGE_KEY_PREFIX}:${userId}`;
    const earned = achievements
      .filter((achievement) => achievement.isEarned)
      .map((achievement) => achievement.id);

    let found: ReadonlySet<string> = NONE;
    try {
      const seen = readSeen(key);
      if (seen !== null) {
        const seenIds = new Set(seen);
        found = new Set(earned.filter((id) => !seenIds.has(id)));
      }
      localStorage.setItem(key, JSON.stringify(earned));
    } catch {
      found = NONE;
    }
    setNewIds(found);
  }, [achievements, userId, newIds]);

  return newIds ?? NONE;
}
