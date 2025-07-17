import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { daysOfWeek } from '@/constants';
import { Frequency } from '@/features/habits/types/Frequency';

interface FrequencySelectorProps {
  selectedDays: Frequency[];
  onFrequencyChange: (days: Frequency[]) => void;
  label?: string;
}

export default function FrequencySelector({
  selectedDays,
  onFrequencyChange,
  label = 'Frequency',
}: FrequencySelectorProps) {
  return (
    <div className="space-y-1 sm:space-y-2">
      <Label className="text-sm text-[var(--color-brand-text)] sm:text-base dark:text-[var(--color-brand-text-light)]">
        {label}
        <span className="text-[var(--color-error)]">*</span>
      </Label>
      <ToggleGroup
        type="multiple"
        className="flex justify-between sm:flex-wrap sm:justify-start sm:gap-2"
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
            className="h-8 w-8 rounded-full text-xs transition-all duration-200 data-[state=off]:bg-[var(--color-surface-tertiary)] data-[state=off]:text-[var(--color-text-secondary)] data-[state=off]:hover:bg-[var(--color-hover-brand)] data-[state=off]:hover:text-[var(--color-text-inverse)] data-[state=on]:bg-[var(--color-brand-primary)] data-[state=on]:text-[var(--color-text-inverse)] sm:h-10 sm:w-10 sm:text-sm dark:data-[state=off]:bg-[var(--color-brand-light)] dark:data-[state=off]:text-[var(--color-brand-text-light)] dark:data-[state=off]:hover:bg-[var(--color-brand-primary)] dark:data-[state=on]:bg-[var(--color-brand-primary)]"
          >
            {day[0]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
