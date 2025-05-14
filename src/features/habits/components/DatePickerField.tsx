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
  }
  
  .date-picker-light .react-datepicker__day--keyboard-selected,
  .date-picker-light .react-datepicker__day--selected {
    background-color: #9333ea;
    color: white;
  }
  
  /* Dark mode styles */
  .date-picker-dark .react-datepicker {
    background-color: #1f2937;
    border: 1px solid #4b5563;
    color: #e2e8f0;
  }
  
  .date-picker-dark .react-datepicker__header {
    background-color: #111827;
    border-bottom: 1px solid #4b5563;
  }
  
  .date-picker-dark .react-datepicker__current-month,
  .date-picker-dark .react-datepicker__day-name {
    color: #c084fc;
  }
  
  .date-picker-dark .react-datepicker__day {
    color: #e2e8f0;
  }
  
  .date-picker-dark .react-datepicker__day--outside-month {
    color: #6b7280;
  }
  
  .date-picker-dark .react-datepicker__day:hover {
    background-color: #374151;
  }
  
  .date-picker-dark .react-datepicker__day--keyboard-selected,
  .date-picker-dark .react-datepicker__day--selected {
    background-color: #a855f7;
    color: white;
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
        popperClassName="z-50"
      />
    </div>
  );
}
