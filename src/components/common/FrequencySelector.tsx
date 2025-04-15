import { useContext } from 'react';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { daysOfWeek } from '@/constants';
import { Frequency } from '@/types/frequency';
import { AppContext } from '@/context/AppContext';

interface FrequencySelectorProps {
  selectedDays: Frequency[];
  onFrequencyChange: (days: Frequency[]) => void;
}

export default function FrequencySelector({
  selectedDays,
  onFrequencyChange,
}: FrequencySelectorProps) {
  const { isDarkMode } = useContext(AppContext);

  return (
    <div className="space-y-2">
      <Label
        className={`${
          isDarkMode ? 'text-purple-300' : 'text-purple-700'
        }`}
      >
        Frequency
      </Label>
      <ToggleGroup
        type="multiple"
        className="flex flex-wrap gap-2 justify-start"
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
            className={`w-10 h-10 rounded-full data-[state=off]:hover:text-white ${
              isDarkMode
                ? 'data-[state=on]:bg-purple-400 data-[state=on]:text-white data-[state=off]:bg-gray-700 data-[state=off]:text-gray-300 data-[state=off]:hover:bg-purple-300'
                : 'data-[state=on]:bg-purple-500 data-[state=on]:text-white data-[state=off]:bg-gray-100 data-[state=off]:text-gray-600 data-[state=off]:hover:bg-purple-400'
            }`}
          >
            {day[0]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}