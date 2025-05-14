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
    <div className="space-y-2">
      <Label
        className={`${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
      >
        {label}
      </Label>
      <RadioGroup
        className="grid grid-cols-5 sm:grid-cols-9 gap-2"
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
                ? "border-gray-600 bg-gray-700 hover:text-purple-200 hover:border-purple-200 [&:has([data-state=checked])]:border-purple-400 [&:has([data-state=checked])]:text-purple-400"
                : "border-purple-200 bg-white hover:bg-purple-100 hover:text-purple-800 [&:has([data-state=checked])]:border-purple-600 [&:has([data-state=checked])]:text-purple-600"
            } p-2 transition-all cursor-pointer`}
          >
            <RadioGroupItem value={name} id={name} className="sr-only" />
            <Icon className="h-6 w-6" />
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
