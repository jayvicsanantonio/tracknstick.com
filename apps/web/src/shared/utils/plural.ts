// Picks the singular or plural form of a word for a count, as in "1 day" and "3 days".
// English rules only: one is singular, everything else (zero included) is plural.

export function plural(
  count: number,
  singular: string,
  pluralForm = `${singular}s`,
): string {
  return count === 1 ? singular : pluralForm;
}
