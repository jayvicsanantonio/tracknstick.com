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
