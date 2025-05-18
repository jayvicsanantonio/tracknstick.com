import { Input } from "@/components/ui/input";

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
        className="pl-10"
      />
    </div>
  );
}
