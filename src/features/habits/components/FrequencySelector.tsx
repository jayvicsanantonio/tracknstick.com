import { useContext } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { daysOfWeek } from "@/constants";
import { Frequency } from "@/features/habits/types/Frequency";
import { ThemeContext } from "@/context/ThemeContext";

interface FrequencySelectorProps {
  selectedDays: Frequency[];
  onFrequencyChange: (days: Frequency[]) => void;
  label?: string;
}

export default function FrequencySelector({
  selectedDays,
  onFrequencyChange,
  label = "Frequency",
}: FrequencySelectorProps) {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className="space-y-1 sm:space-y-2">
      <Label
        className={`text-sm sm:text-base ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
      >
        {label}
        <span className="text-red-500">*</span>
      </Label>
      <ToggleGroup
        type="multiple"
        className="flex justify-between sm:justify-start sm:flex-wrap sm:gap-2"
        aria-label="Select days of the week"
        value={selectedDays}
        onValueChange={(value) => {
          onFrequencyChange(value as Frequency[]);
        }}
      >
        {daysOfWeek.map((day) => (
          <ToggleGroupItem
            key={day}
            value={day}
            aria-label={day}
            title={day}
            className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm rounded-full transition-all duration-200 data-[state=off]:hover:text-white ${
              isDarkMode
                ? "data-[state=on]:bg-purple-600 data-[state=on]:text-white data-[state=off]:bg-purple-900/50 data-[state=off]:text-purple-400 data-[state=off]:hover:bg-purple-500"
                : "data-[state=on]:bg-purple-500 data-[state=on]:text-white data-[state=off]:bg-gray-100 data-[state=off]:text-gray-600 data-[state=off]:hover:bg-purple-400"
            }`}
          >
            {day[0]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
