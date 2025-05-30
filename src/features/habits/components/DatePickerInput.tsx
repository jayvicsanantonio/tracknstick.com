import { useContext } from "react";
import { Input } from "@/components/ui/input";
import { ThemeContext } from "@/context/ThemeContext";

export interface DatePickerInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
  id: string;
}

export const datePickerInputStyles = `
  .date-picker-input-wrapper {
    width: 100%;
    position: relative;
  }
  
  .date-picker-input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 1;
    transition: color 0.2s ease;
  }
  
  /* Dark mode icon styling */
  .date-picker-dark .date-picker-input-icon {
    color: #d8b4fe;
  }
  
  /* Light mode icon styling */
  .date-picker-light .date-picker-input-icon {
    color: #9333ea;
  }
  
  /* Icon pulse animation on focus */
  .date-picker-input-wrapper:focus-within .calendar-icon-path {
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

export default function DatePickerInput({
  value,
  onClick,
  placeholder,
  id,
}: DatePickerInputProps) {
  const { isDarkMode } = useContext(ThemeContext);
  const themeClass = isDarkMode ? "date-picker-dark" : "date-picker-light";

  return (
    <div className={`date-picker-input-wrapper ${themeClass}`}>
      <div className="date-picker-input-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            className="calendar-icon-path"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <Input
        id={id}
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        readOnly
        className={`pl-10 cursor-pointer ${isDarkMode ? "bg-gray-800 border-purple-900 placeholder:text-purple-500/50" : ""}`}
        aria-label={placeholder ?? "Select date"}
      />
    </div>
  );
}
