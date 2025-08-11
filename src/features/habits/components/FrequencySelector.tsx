import { memo, useCallback } from 'react';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@shared/components/ui/toggle-group';
import { Label } from '@shared/components/ui/label';
import { daysOfWeek } from '@shared/constants';
import { Frequency } from '@/features/habits/types/Frequency';

interface FrequencySelectorProps {
  selectedDays: Frequency[];
  onFrequencyChange: (days: Frequency[]) => void;
  label?: string;
}

const FrequencySelector = memo(function FrequencySelector({
  selectedDays,
  onFrequencyChange,
  label = 'Frequency',
}: FrequencySelectorProps) {
  const handleValueChange = useCallback(
    (value: string[]) => {
      onFrequencyChange(value as Frequency[]);
    },
    [onFrequencyChange],
  );
  return (
    <div className="space-y-1 sm:space-y-2">
      <Label className="text-(--color-brand-text) dark:text-(--color-brand-text-light) text-sm sm:text-base">
        {label}
        <span className="text-(--color-error)">*</span>
      </Label>
      <ToggleGroup
        type="multiple"
        className="flex justify-between sm:flex-wrap sm:justify-start sm:gap-2"
        aria-label="Select days of the week"
        value={selectedDays}
        onValueChange={handleValueChange}
      >
        {daysOfWeek.map((day) => (
          <ToggleGroupItem
            key={day}
            value={day}
            aria-label={day}
            title={day}
            className="data-[state=off]:bg-(--color-surface-tertiary) data-[state=off]:text-(--color-text-secondary) data-[state=off]:border-(--color-border-primary) data-[state=off]:hover:bg-(--color-hover-brand) data-[state=off]:hover:text-(--color-text-inverse) data-[state=off]:hover:border-(--color-brand-primary) data-[state=on]:bg-(--color-brand-primary) data-[state=on]:text-(--color-text-inverse) data-[state=on]:border-(--color-brand-primary) dark:data-[state=off]:bg-(--color-brand-light) dark:data-[state=off]:text-(--color-brand-text-light) dark:data-[state=off]:border-(--color-border-primary) dark:data-[state=off]:hover:border-(--color-brand-primary) dark:data-[state=on]:bg-(--color-brand-primary) dark:data-[state=on]:text-(--color-text-inverse) dark:data-[state=on]:border-(--color-brand-primary) dark:data-[state=on]:shadow-(--color-brand-primary)/30 h-8 w-8 rounded-full text-xs transition-all duration-200 data-[state=off]:border-2 data-[state=on]:border-2 data-[state=on]:font-bold data-[state=on]:shadow-lg sm:h-10 sm:w-10 sm:text-sm dark:data-[state=off]:border-2 dark:data-[state=on]:border-2 dark:data-[state=on]:shadow-lg"
          >
            {day[0]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
});

export default FrequencySelector;
