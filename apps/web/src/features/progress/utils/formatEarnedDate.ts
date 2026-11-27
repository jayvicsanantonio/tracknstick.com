// Formats when an achievement was earned as the user's own calendar day: "Earned Nov 18, 2026".
// earnedAt is SQLite's UTC CURRENT_TIMESTAMP, so it is parsed as UTC before it is shown.

import { parseUTCTimestamp } from '@shared/utils/date/formatDate';

const EARNED_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

export function formatEarnedDate(earnedAt: string): string {
  return `Earned ${parseUTCTimestamp(earnedAt).toLocaleDateString(
    undefined,
    EARNED_DATE_OPTIONS,
  )}`;
}
