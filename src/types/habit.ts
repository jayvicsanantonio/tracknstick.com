import { icons } from "lucide-react";
import { Frequency } from "@/types/frequency";

export interface Habit {
  id: string;
  name: string;
  icon: keyof typeof icons;
  frequency: Frequency[];
  completed: boolean;
}
