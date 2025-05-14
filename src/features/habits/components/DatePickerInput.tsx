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
  }
`;

export default function DatePickerInput({
  value,
  onClick,
  placeholder,
  id,
}: DatePickerInputProps) {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className="date-picker-input-wrapper">
      <div className="date-picker-input-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
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
        className={`w-full pl-10 cursor-pointer ${
          isDarkMode
            ? "bg-gray-700 border-gray-600 focus:border-purple-400 text-purple-300 focus-visible:ring-purple-400"
            : "bg-white border-purple-300 focus:border-purple-500 focus-visible:ring-purple-300"
        }`}
      />
    </div>
  );
}
