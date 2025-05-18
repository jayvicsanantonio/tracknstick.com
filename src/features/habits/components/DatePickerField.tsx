import { useContext } from "react";
import DatePicker from "react-datepicker";
import { Label } from "@/components/ui/label";
import { ThemeContext } from "@/context/ThemeContext";
import DatePickerInput, {
  datePickerInputStyles,
} from "@/features/habits/components/DatePickerInput";

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
  }
  
  .react-datepicker__header {
    padding-top: 0.8em;
  }
  
  .react-datepicker__navigation {
    top: 1em;
  }
  
  .react-datepicker__day--keyboard-selected,
  .react-datepicker__day--selected {
    border-radius: 50%;
  }
  
  /* Light mode styles */
  .date-picker-light .react-datepicker {
    background-color: white;
    border: 1px solid #d8b4fe;
  }
  
  .date-picker-light .react-datepicker__header {
    background-color: #f3e8ff;
    border-bottom: 1px solid #d8b4fe;
  }
  
  .date-picker-light .react-datepicker__current-month,
  .date-picker-light .react-datepicker__day-name {
    color: #6b21a8;
  }
  
  .date-picker-light .react-datepicker__day {
    color: #3f3f46;
  }
  
  
  .date-picker-light .react-datepicker__day:hover {
    background-color: #f3e8ff;
    border-radius: 100%
  }

  .date-picker-dark .react-datepicker__day:hover {
    color: #000000;
    background-color: #f3e8ff;
    border-radius: 100%
  }
  
  .date-picker-light .react-datepicker__day--keyboard-selected,
  .date-picker-light .react-datepicker__day--selected {
    background-color: #9333ea;
    color: white;
  }
  
  /* Dark mode styles */
  .date-picker-dark .react-datepicker {
    background-color: #121228;
    border: 1px solid #4b1b94;
    color: #d8b4fe;
  }
  
  .date-picker-dark .react-datepicker__header {
    background-color: #121228;
    border-bottom: 1px solid #4b1b94;
  }
  
  .date-picker-dark .react-datepicker__current-month,
  .date-picker-dark .react-datepicker__day-name {
    color: #d8b4fe;
  }
  
  .date-picker-dark .react-datepicker__day {
    color: #a1a1aa;
    background: transparent;
  }

  .react-datepicker__day-name {
    margin: 0 0.25rem;
    font-weight: 700;
  }

  .date-picker-light .react-datepicker__month,
  .date-picker-dark .react-datepicker__month {
    background: #ffffff;
    margin: 0;
    padding: 0.4rem
  }

  .date-picker-dark .react-datepicker__month {
    background-color: #121228;
  }

  .date-picker-dark .react-datepicker__day--keyboard-selected,
  .date-picker-dark .react-datepicker__day--selected {
    background-color: #9333ea;
    color: white;
  }

  .react-datepicker__close-icon::after {
    background-color: #9333ea;
  }

  .react-datepicker__header {
    padding: 0.8em 0;
    border-bottom-width: 1px;
    border-bottom-style: solid;
  }

  .date-picker-light .react-datepicker__header {
    background-color: white;
    border-bottom-color: #f4f4f5;
  }

  .date-picker-dark .react-datepicker__header {
    background-color: #121228;
    border-bottom-color: #4b1b94;
  }


  .date-picker-dark.react-datepicker {
    border-color: #4b1b94;
  }

  .react-datepicker__day {
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

  .date-picker-dark .react-datepicker__current-month,
  .date-picker-light .react-datepicker__current-month {
    padding: 8px 0;
  }
  

  .date-picker-light .react-datepicker__day--outside-month {
    color: #a1a1aa;
  }

  .date-picker-dark .react-datepicker__day--outside-month {
    color: #6b21a8;
  }

  .date-picker-dark .react-datepicker__month-container {
    background-color: #121228;
  }

  .date-picker-dark.react-datepicker-popper .react-datepicker__triangle {
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
  heightClass = "h-16",
}: DatePickerFieldProps) {
  const { isDarkMode } = useContext(ThemeContext);
  const themeClass = isDarkMode ? "date-picker-dark" : "date-picker-light";

  return (
    <div className={`space-y-2 ${heightClass}`}>
      <Label
        htmlFor={id}
        className={`${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
      >
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <DatePicker
        selected={selected}
        onChange={onChange}
        customInput={<DatePickerInput id={id} placeholder={placeholder} />}
        calendarClassName={themeClass}
        dateFormat="MM/dd/yyyy"
        isClearable={isClearable}
        placeholderText={placeholder}
        wrapperClassName="w-full"
        popperClassName={`z-50 ${themeClass}`}
      />
    </div>
  );
}
