import { InsightData } from "./InsightData";

export interface CalendarDay {
  dayOfMonth: number;
  isPast: boolean;
  isToday: boolean;
  date: Date;
  dayData?: InsightData;
}
