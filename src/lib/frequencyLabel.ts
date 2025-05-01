import { Frequency } from "@/features/habits/types";

export default function frequencyLabel(frequency: Frequency[]) {
  if (frequency.length === 7) {
    return "Daily";
  }

  if (frequency.length === 1) {
    return "Weekly";
  }

  return `${frequency.length}x a week`;
}
