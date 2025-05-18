import { useContext } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import HabitsIcons from "@/icons/habits";
import { ThemeContext } from "@/context/ThemeContext";

interface IconPickerProps {
  selectedIcon: keyof typeof HabitsIcons | undefined;
  onIconChange: (icon: keyof typeof HabitsIcons) => void;
  label?: string;
}

export default function IconPicker({
  selectedIcon,
  onIconChange,
  label = "Icon",
}: IconPickerProps) {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className="space-y-1 sm:space-y-2">
      <Label
        className={`text-sm sm:text-base ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
      >
        {label}
        <span className="text-red-500">*</span>
      </Label>
      <div className="overflow-y-auto max-h-[7.5rem] sm:max-h-[9.5rem] pb-1">
        <RadioGroup
          className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-1.5 sm:gap-2"
          value={selectedIcon}
          onValueChange={(value) => {
            onIconChange(value as keyof typeof HabitsIcons);
          }}
        >
          {Object.entries(HabitsIcons).map(([name, Icon]) => (
            <Label
              key={name}
              className={`flex items-center justify-center rounded-md border-2 ${
                isDarkMode
                  ? "border-purple-900 bg-purple-900/50 hover:text-purple-300 hover:border-purple-500 [&:has([data-state=checked])]:border-purple-600 [&:has([data-state=checked])]:text-purple-500"
                  : "border-purple-200 bg-white hover:bg-purple-100 hover:text-purple-800 [&:has([data-state=checked])]:bg-purple-100 [&:has([data-state=checked])]:border-purple-600 [&:has([data-state=checked])]:text-purple-600"
              } p-1.5 sm:p-2 transition-all cursor-pointer`}
            >
              <RadioGroupItem value={name} id={name} className="sr-only" />
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </Label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
