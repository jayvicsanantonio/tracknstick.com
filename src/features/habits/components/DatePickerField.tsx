import { memo } from 'react';
import DatePicker from 'react-datepicker';
import { Label } from '@shared/components/ui/label';
import DatePickerInput, {
  datePickerInputStyles,
} from '@/features/habits/components/DatePickerInput';

interface DatePickerFieldProps {
  id: string;
  label: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  isClearable?: boolean;
  isRequired?: boolean;
  heightClass?: string;
}

export const datePickerCalendarStyles = `
  .react-datepicker {
    font-family: inherit;
    border-radius: 8px;
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
  
  .react-datepicker__header {
    padding-top: 0.8em;
    background-color: var(--color-surface-secondary);
    border-bottom: 1px solid var(--color-border-primary);
  }
  
  .dark .react-datepicker__header {
    background-color: var(--color-surface-secondary);
    border-bottom: 1px solid var(--color-border-primary);
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

const DatePickerField = memo(function DatePickerField({
  id,
  label,
  selected,
  onChange,
  placeholder,
  isClearable = false,
  isRequired = false,
  heightClass = 'h-16',
}: DatePickerFieldProps) {
  return (
    <div className={`space-y-2 ${heightClass}`}>
      <Label
        htmlFor={id}
        className="text-(--color-brand-text) dark:text-(--color-brand-text-light)"
      >
        {label}
        {isRequired && <span className="text-(--color-error) ml-1">*</span>}
      </Label>
      <DatePicker
        selected={selected}
        onChange={onChange}
        customInput={<DatePickerInput id={id} placeholder={placeholder} />}
        dateFormat="MM/dd/yyyy"
        isClearable={isClearable}
        placeholderText={placeholder}
        wrapperClassName="w-full"
        popperClassName="z-50"
      />
    </div>
  );
});

export default DatePickerField;
