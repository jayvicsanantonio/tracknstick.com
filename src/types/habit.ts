import { icons } from "lucide-react";

export interface Habit {
  id: number;
  name: string;
  icon: keyof typeof icons;
  frequency: string[];
  completed: boolean;
}
