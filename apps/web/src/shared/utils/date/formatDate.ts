/**
 * Calculates the UTC offset in milliseconds for a specific date/time in a timezone.
 * Positive offset means timezone is ahead of UTC (e.g., UTC+8 returns positive value).
 */
function getTimezoneOffsetMs(dateTimeStr: string, timezone: string): number {
  // Parse as if it were UTC
  const asUtc = new Date(`${dateTimeStr}Z`);

  // Get the same instant formatted in the target timezone
  const tzFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = tzFormatter.formatToParts(asUtc);
  const getPart = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '';

  const tzYear = parseInt(getPart('year'), 10);
  const tzMonth = parseInt(getPart('month'), 10);
  const tzDay = parseInt(getPart('day'), 10);
  const tzHour = parseInt(getPart('hour'), 10);
  const tzMinute = parseInt(getPart('minute'), 10);
  const tzSecond = parseInt(getPart('second'), 10);

  // Create a date from the timezone components (as if they were UTC)
  const tzAsUtc = Date.UTC(
    tzYear,
    tzMonth - 1,
    tzDay,
    tzHour,
    tzMinute,
    tzSecond,
  );

  // The difference is the offset
  return tzAsUtc - asUtc.getTime();
}

type DayBoundary = 'start' | 'end';

// The offset is probed at 23:59:59 while the instant is built from
// 23:59:59.999. Keep both literals: using one for both shifts the end
// boundary by a millisecond.
const BOUNDARY = {
  start: { probe: '00:00:00', instant: '00:00:00.000' },
  end: { probe: '23:59:59', instant: '23:59:59.999' },
} as const;

/** The local calendar date an instant falls on, as YYYY-MM-DD. */
function toLocalDateKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * The UTC instant at one edge of the local day that `date` falls on.
 *
 * The input's time of day is discarded: only its calendar date in `timezone`
 * matters, which is why this is idempotent.
 */
function localDayBoundaryUTC(
  date: Date,
  timezone: string,
  boundary: DayBoundary,
): Date {
  const dateStr = toLocalDateKey(date, timezone);
  const { probe, instant } = BOUNDARY[boundary];

  const result = new Date(`${dateStr}T${instant}Z`);
  result.setTime(
    result.getTime() - getTimezoneOffsetMs(`${dateStr}T${probe}`, timezone),
  );

  return result;
}

/**
 * Gets the UTC timestamp that corresponds to midnight (00:00:00) of the given
 * date in the specified timezone.
 */
export function getLocalStartofDayUTC(date: Date, timezone: string): Date {
  return localDayBoundaryUTC(date, timezone, 'start');
}

/**
 * Gets the UTC timestamp that corresponds to end of day (23:59:59.999) of the
 * given date in the specified timezone.
 */
export function getLocalEndOfDayUTC(date: Date, timezone: string): Date {
  return localDayBoundaryUTC(date, timezone, 'end');
}

export default function formatDate(date: string | null): string {
  if (!date) {
    return 'Never';
  }

  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
