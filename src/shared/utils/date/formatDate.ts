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

/**
 * Gets the UTC timestamp that corresponds to midnight (00:00:00) of the given date
 * in the specified timezone.
 *
 * @param date - The input date
 * @param timezone - The IANA timezone name (e.g., 'America/Los_Angeles')
 * @returns Date object representing the UTC time of midnight in the given timezone
 */
export function getLocalStartofDayUTC(date: Date, timezone: string): Date {
  // Get the date string (YYYY-MM-DD) in the target timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateStr = formatter.format(date);

  // Calculate offset for start of day in target timezone
  const startOffset = getTimezoneOffsetMs(`${dateStr}T00:00:00`, timezone);

  // Start of day in target timezone = midnight in TZ converted to UTC
  const localeStart = new Date(`${dateStr}T00:00:00Z`);
  localeStart.setTime(localeStart.getTime() - startOffset);

  return localeStart;
}

/**
 * Gets the UTC timestamp that corresponds to end of day (23:59:59.999) of the given date
 * in the specified timezone.
 *
 * @param date - The input date
 * @param timezone - The IANA timezone name (e.g., 'America/Los_Angeles')
 * @returns Date object representing the UTC time of end of day in the given timezone
 */
export function getLocalEndOfDayUTC(date: Date, timezone: string): Date {
  // Get the date string (YYYY-MM-DD) in the target timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateStr = formatter.format(date);

  // Calculate offset for end of day in target timezone
  const endOffset = getTimezoneOffsetMs(`${dateStr}T23:59:59`, timezone);

  // End of day in target timezone = 23:59:59.999 in TZ converted to UTC
  const localeEnd = new Date(`${dateStr}T23:59:59.999Z`);
  localeEnd.setTime(localeEnd.getTime() - endOffset);

  return localeEnd;
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
