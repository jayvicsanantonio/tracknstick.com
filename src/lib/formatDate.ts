export function getLocalStartofDayUTC(date: Date, timezone: string): Date {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find((p) => p.type === "year")?.value ?? "", 10);
  const month = parseInt(
    parts.find((p) => p.type === "month")?.value ?? "",
    10,
  );
  const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "", 10);

  const offsetStart = new Date(
    new Date(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00`,
    ).toLocaleString("en-US", { timeZone: timezone }),
  );

  return new Date(offsetStart.toISOString());
}

export function getLocalEndOfDayUTC(date: Date, timezone: string): Date {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Invalid date or timezone");
  }

  const localEndOfDayStr = `${year}-${month}-${day}T23:59:59`;

  const localEndOfDay = new Date(
    new Date(localEndOfDayStr).toLocaleString("en-US", {
      timeZone: timezone,
    }),
  );

  return new Date(localEndOfDay.toISOString());
}

export default function formatDate(date: string | null): string {
  if (!date) {
    return "Never";
  }

  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
