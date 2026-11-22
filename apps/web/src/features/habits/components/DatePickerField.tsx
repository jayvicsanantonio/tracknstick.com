// A labelled date field for the habit form: the device's own date input, so iOS opens its native picker.
// It reads and reports whole local days; an emptied field reports no date.

import { memo } from 'react';
import { Calendar } from 'lucide-react';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';

interface DatePickerFieldProps {
  id: string;
  label: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  isRequired?: boolean;
}

/** The day, as a date input holds it: `YYYY-MM-DD`, in local time. */
function toInputValue(date: Date | null): string {
  if (!date) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The start of the day a date input holds, in local time; null when empty. */
function fromInputValue(value: string): Date | null {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

const DatePickerField = memo(function DatePickerField({
  id,
  label,
  selected,
  onChange,
  isRequired = false,
}: DatePickerFieldProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-sm font-semibold text-(--color-brand-text) dark:text-(--color-brand-text-light)"
      >
        {label}
        {isRequired && <span className="text-(--color-error)">*</span>}
      </Label>
      <div className="relative">
        <Calendar
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-(--color-brand-primary)"
        />
        {/* appearance-none and the left-aligned value keep iOS from drawing
            its own centred, shorter field in place of this one. */}
        <Input
          id={id}
          type="date"
          value={toInputValue(selected)}
          onChange={(event) => onChange(fromInputValue(event.target.value))}
          required={isRequired}
          className="h-11 appearance-none rounded-xl pl-10 text-left sm:h-10 dark:border-(--color-border-brand) dark:bg-(--color-surface-secondary) [&::-webkit-date-and-time-value]:text-left"
        />
      </div>
    </div>
  );
});

export default DatePickerField;
