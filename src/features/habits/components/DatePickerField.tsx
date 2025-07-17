import DatePicker from 'react-datepicker';
import { Label } from '@/components/ui/label';
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
    background-color: white;
    border: 1px solid #d8b4fe;
  }
  
  .dark .react-datepicker {
    background-color: #121228;
    border: 1px solid #4b1b94;
    color: #d8b4fe;
  }
  
  .react-datepicker__header {
    padding-top: 0.8em;
    background-color: #f3e8ff;
    border-bottom: 1px solid #d8b4fe;
  }
  
  .dark .react-datepicker__header {
    background-color: #121228;
    border-bottom: 1px solid #4b1b94;
  }
  
  .react-datepicker__navigation {
    top: 1em;
  }
  
  .react-datepicker__day--keyboard-selected,
  .react-datepicker__day--selected {
    border-radius: 50%;
    background-color: #9333ea;
    color: white;
  }
  
  .react-datepicker__current-month,
  .react-datepicker__day-name {
    color: #6b21a8;
  }
  
  .dark .react-datepicker__current-month,
  .dark .react-datepicker__day-name {
    color: #d8b4fe;
  }
  
  .react-datepicker__day {
    color: #3f3f46;
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
    color: #a1a1aa;
    background: transparent;
  }
  
  .react-datepicker__day:hover {
    background-color: #f3e8ff;
    border-radius: 100%;
  }

  .dark .react-datepicker__day:hover {
    color: #000000;
    background-color: #f3e8ff;
    border-radius: 100%;
  }

  .react-datepicker__day-name {
    margin: 0 0.25rem;
    font-weight: 700;
  }

  .react-datepicker__month {
    background: #ffffff;
    margin: 0;
    padding: 0.4rem;
  }

  .dark .react-datepicker__month {
    background-color: #121228;
  }

  .react-datepicker__close-icon::after {
    background-color: #9333ea;
  }

  .react-datepicker__header {
    padding: 0.8em 0;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    background-color: white;
    border-bottom-color: #f4f4f5;
  }

  .dark .react-datepicker__header {
    background-color: #121228;
    border-bottom-color: #4b1b94;
  }

  .react-datepicker__current-month {
    padding: 8px 0;
  }
  
  .react-datepicker__day--outside-month {
    color: #a1a1aa;
  }

  .dark .react-datepicker__day--outside-month {
    color: #6b21a8;
  }

  .dark .react-datepicker__month-container {
    background-color: #121228;
  }

  .dark .react-datepicker-popper .react-datepicker__triangle {
    fill: #121228;
    color: #121228;
    stroke: #121228;
  }
`;

export const datePickerStyles = `
  ${datePickerCalendarStyles}
  ${datePickerInputStyles}
`;

export default function DatePickerField({
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
        {isRequired && <span className="ml-1 text-(--color-error)">*</span>}
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
}
