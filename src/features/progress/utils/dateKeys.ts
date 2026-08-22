/**
 * Calendar dates as the progress API exchanges them: YYYY-MM-DD, already
 * resolved into the user's timezone by the server.
 *
 * Both directions go through local date components on purpose. Date's string
 * parser treats a bare YYYY-MM-DD as UTC midnight and toISOString() converts
 * back to UTC, so either one silently shifts the day for readers west of
 * Greenwich -- an axis labelled 31 for the 1st, a calendar cell reading the
 * neighbouring month's score.
 */

/** The local calendar date an instant falls on. */
export function toDateKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The local Date a key names, at midnight. */
export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}
