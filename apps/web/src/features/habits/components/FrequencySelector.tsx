import { memo, useCallback } from 'react';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@shared/components/ui/toggle-group';
import { Label } from '@shared/components/ui/label';
import { daysOfWeek } from '@shared/constants';
import { Frequency } from '@/features/habits/types/Frequency';
import { IosHapticTarget } from '@shared/components/ui/ios-haptic-target';
import { triggerHaptic } from '@shared/utils/haptics';
import { cn } from '@shared/utils/utils';

interface FrequencySelectorProps {
  selectedDays: Frequency[];
  onFrequencyChange: (days: Frequency[]) => void;
  label?: string;
}

const PRESETS: { label: string; days: Frequency[] }[] = [
  {
    label: 'Daily',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  {
    label: 'Weekdays',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  {
    label: 'Weekends',
    days: ['Sun', 'Sat'],
  },
];

function sameDaySet(a: Frequency[], b: Frequency[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((day) => setA.has(day));
}

const FrequencySelector = memo(function FrequencySelector({
  selectedDays,
  onFrequencyChange,
  label = 'Frequency',
}: FrequencySelectorProps) {
  const handleValueChange = useCallback(
    (value: string[]) => {
      triggerHaptic('selection');
      onFrequencyChange(value as Frequency[]);
    },
    [onFrequencyChange],
  );

  return (
    <div className="space-y-2.5 sm:space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-sm font-semibold text-(--color-brand-text) dark:text-(--color-brand-text-light)">
          {label}
          <span className="text-(--color-error)">*</span>
        </Label>
        {/* Quick frequency presets for effortless 1-tap scheduling */}
        <div className="flex items-center gap-1.5">
          {PRESETS.map((preset) => {
            const active = sameDaySet(selectedDays, preset.days);
            return (
              <IosHapticTarget
                key={preset.label}
                disabled={active}
                className="inline-flex rounded-full"
              >
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    if (!active) {
                      triggerHaptic('selection');
                    }
                    onFrequencyChange(preset.days);
                  }}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors active:scale-95',
                    active
                      ? 'bg-(--color-brand-solid) text-(--color-primary-foreground)'
                      : 'bg-(--color-brand-primary)/10 text-(--color-brand-text) hover:bg-(--color-brand-primary)/18 dark:text-(--color-brand-text-light)',
                  )}
                >
                  {preset.label}
                </button>
              </IosHapticTarget>
            );
          })}
        </div>
      </div>

      <ToggleGroup
        type="multiple"
        className="flex w-full justify-between sm:w-auto sm:flex-wrap sm:justify-start sm:gap-2"
        aria-label="Select days of the week"
        value={selectedDays}
        onValueChange={handleValueChange}
      >
        {daysOfWeek.map((day) => (
          <IosHapticTarget key={day} className="inline-flex rounded-full">
            <ToggleGroupItem
              value={day}
              aria-label={day}
              title={day}
              className="size-10 flex-none rounded-full text-sm transition-all duration-150 active:scale-92 data-[state=off]:border-2 data-[state=off]:border-(--color-border-primary) data-[state=off]:bg-(--color-surface-tertiary) data-[state=off]:text-(--color-text-secondary) data-[state=off]:hover:border-(--color-brand-primary) data-[state=off]:hover:bg-(--color-hover-brand) data-[state=off]:hover:text-(--color-text-inverse) data-[state=on]:border-2 data-[state=on]:border-(--color-brand-solid) data-[state=on]:bg-(--color-brand-solid) data-[state=on]:font-bold data-[state=on]:text-(--color-text-inverse) data-[state=on]:shadow-lg sm:h-10 sm:w-10 sm:text-sm dark:data-[state=off]:border-2 dark:data-[state=off]:border-(--color-border-primary) dark:data-[state=off]:bg-(--color-brand-light) dark:data-[state=off]:text-(--color-brand-text-light) dark:data-[state=off]:hover:border-(--color-brand-primary) dark:data-[state=on]:border-2 dark:data-[state=on]:border-(--color-brand-primary) dark:data-[state=on]:bg-(--color-brand-primary) dark:data-[state=on]:text-(--color-text-inverse) dark:data-[state=on]:shadow-(--color-brand-primary)/30 dark:data-[state=on]:shadow-lg"
            >
              {day[0]}
            </ToggleGroupItem>
          </IosHapticTarget>
        ))}
      </ToggleGroup>
    </div>
  );
});

export default FrequencySelector;
