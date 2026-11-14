// A habit's streak and completion figures, as GET /habits/:id/stats returns them.
// The shape is defined in the contracts package; `lastCompleted` is absent until the first completion.

export type { HabitStatsResponse as HabitStats } from '@tracknstick/contracts';
