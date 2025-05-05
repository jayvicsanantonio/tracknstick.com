import { Frequency } from "@/features/habits/types/Frequency";

export const getDaysOfWeek = (locale = "en-US"): Frequency[] => {
  return Array.from({ length: 7 }, (_, i) => {
    return new Intl.DateTimeFormat(locale, { weekday: "short" })
      .format(new Date(2024, 0, i + 7))
      .slice(0, 3) as Frequency;
  });
};

export const daysOfWeek: Frequency[] = getDaysOfWeek();
