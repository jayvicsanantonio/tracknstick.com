// Idle & touch-start chunk preloader so tapping a bottom tab or "+" never stalls
// waiting for a lazy-loaded route or form chunk.

const loaders = {
  dashboard: () => import('@/pages/DashboardPage'),
  habits: () => import('@/pages/HabitsPage'),
  progress: () => import('@/pages/ProgressPage'),
  coach: () => import('@/pages/CoachPage'),
  habitForm: () => import('@/features/habits/components/HabitForm'),
} as const;

export type PreloadTarget = keyof typeof loaders;

const started = new Set<PreloadTarget>();

export function preloadChunk(target: PreloadTarget): void {
  if (started.has(target)) return;
  started.add(target);
  void loaders[target]().catch(() => {
    started.delete(target);
  });
}

export function preloadAllPrimaryChunksWhenIdle(): void {
  if (typeof window === 'undefined') return;
  const run = () => {
    preloadChunk('habits');
    preloadChunk('progress');
    preloadChunk('coach');
    preloadChunk('habitForm');
  };

  const w = window as Window & {
    requestIdleCallback?: (
      cb: () => void,
      opts?: { timeout: number },
    ) => number;
  };
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(run, { timeout: 2500 });
  } else {
    window.setTimeout(run, 1500);
  }
}
