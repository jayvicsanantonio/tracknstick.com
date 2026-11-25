// Habit form date field: uses Apple's native UIKit date picker (<input type="date">)
// on phones (< sm) and react-datepicker on wider desktop screens.

import { memo } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, X } from 'lucide-react';
import { Label } from '@shared/components/ui/label';
import DatePickerInput, {
  datePickerInputStyles,
} from '@/features/habits/components/DatePickerInput';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import { triggerHaptic } from '@shared/utils/haptics';

interface DatePickerFieldProps {
  id: string;
  label: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  isClearable?: boolean;
  isRequired?: boolean;
}

const datePickerCalendarStyles = `
  .react-datepicker {
    font-family: inherit;
    border-radius: 12px;
    overflow: hidden;
    background-color: var(--color-card);
    border: 1px solid var(--color-border-primary);
    color: var(--color-card-foreground);
  }
  
  .dark .react-datepicker {
    background-color: var(--color-card);
    border: 1px solid var(--color-border-primary);
    color: var(--color-card-foreground);
  }
  
  .react-datepicker__navigation {
    top: 1em;
  }
  
  .react-datepicker__day--keyboard-selected,
  .react-datepicker__day--selected {
    border-radius: 50%;
    background-color: var(--color-brand-primary);
    color: var(--color-text-inverse);
  }
  
  .react-datepicker__current-month,
  .react-datepicker__day-name {
    color: var(--color-brand-text);
  }
  
  .dark .react-datepicker__current-month,
  .dark .react-datepicker__day-name {
    color: var(--color-brand-text);
  }
  
  .react-datepicker__day {
    color: var(--color-foreground);
    margin: 0;
    width: 2.2rem;
    height: 2.2rem;
    line-height: 2.2rem;
    transition: all 0.2s ease;
    font-weight: 500;
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .dark .react-datepicker__day {
    color: var(--color-foreground);
    background: transparent;
  }
  
  .react-datepicker__day:hover {
    background-color: var(--color-hover-surface);
    border-radius: 100%;
  }

  .dark .react-datepicker__day:hover {
    color: var(--color-foreground);
    background-color: var(--color-hover-surface);
    border-radius: 100%;
  }

  .react-datepicker__day-name {
    margin: 0 0.25rem;
    font-weight: 700;
  }

  .react-datepicker__month {
    background: var(--color-card);
    margin: 0;
    padding: 0.4rem;
  }

  .dark .react-datepicker__month {
    background-color: var(--color-card);
  }

  .react-datepicker__close-icon::after {
    background-color: var(--color-brand-primary);
  }

  .react-datepicker__header {
    padding: 0.8em 0;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    background-color: var(--color-card);
    border-bottom-color: var(--color-border-primary);
  }

  .dark .react-datepicker__header {
    background-color: var(--color-card);
    border-bottom-color: var(--color-border-primary);
  }

  .react-datepicker__current-month {
    padding: 8px 0;
  }
  
  .react-datepicker__day--outside-month {
    color: var(--color-text-tertiary);
  }

  .dark .react-datepicker__day--outside-month {
    color: var(--color-text-tertiary);
  }

  .dark .react-datepicker__month-container {
    background-color: var(--color-card);
  }

  .dark .react-datepicker-popper .react-datepicker__triangle {
    fill: var(--color-card);
    color: var(--color-card);
    stroke: var(--color-card);
  }
`;

export const datePickerStyles = `
  ${datePickerCalendarStyles}
  ${datePickerInputStyles}
`;

/** Formats a Date into local YYYY-MM-DD for native <input type="date">. */
function toDateInputValue(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parses YYYY-MM-DD from native <input type="date"> into a local Date. */
function fromDateInputValue(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

const DatePickerField = memo(function DatePickerField({
  id,
  label,
  selected,
  onChange,
  placeholder,
  isClearable = false,
  isRequired = false,
}: DatePickerFieldProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-1.5">
        <Label
          htmlFor={id}
          className="text-sm font-semibold text-(--color-brand-text) dark:text-(--color-brand-text-light)"
        >
          {label}
          {isRequired && <span className="text-(--color-error)">*</span>}
        </Label>
        <div className="relative flex items-center">
          <Calendar
            aria-hidden="true"
            className="pointer-events-none absolute left-3 size-4 text-(--color-brand-primary)"
          />
          <input
            id={id}
            type="date"
            required={isRequired}
            value={toDateInputValue(selected)}
            onChange={(event) => {
              triggerHaptic('selection');
              onChange(fromDateInputValue(event.target.value));
            }}
            className="h-11 w-full appearance-none rounded-xl border-2 border-(--color-border-primary) bg-(--color-surface) pr-10 pl-9 text-base text-(--color-foreground) tabular-nums outline-none focus:border-(--color-ring) focus-visible:ring-2 focus-visible:ring-(--color-ring)/40 dark:border-(--color-border-brand) dark:bg-(--color-surface-secondary)"
          />
          {isClearable && selected ? (
            <button
              type="button"
              aria-label={`Clear ${label}`}
              onClick={() => onChange(null)}
              className="absolute right-2 flex size-7 items-center justify-center rounded-full bg-(--color-muted) text-(--color-text-secondary) active:scale-90"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-sm font-semibold text-(--color-brand-text) dark:text-(--color-brand-text-light)"
      >
        {label}
        {isRequired && <span className="text-(--color-error)">*</span>}
      </Label>
      <DatePicker
        id={id}
        selected={selected}
        onChange={onChange}
        customInput={<DatePickerInput id={id} placeholder={placeholder} />}
        dateFormat="MM/dd/yyyy"
        isClearable={isClearable}
        placeholderText={placeholder}
        wrapperClassName="w-full"
        popperClassName="z-50"
        popperProps={{ strategy: 'fixed' }}
      />
    </div>
  );
});

export default DatePickerField;
