import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import HabitsIcons from "@/icons/habits";

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
  return (
    <div className="space-y-1 sm:space-y-2">
      <Label className="text-sm sm:text-base text-[var(--color-brand-text)] dark:text-[var(--color-brand-text-light)]">
        {label}
        <span className="text-[var(--color-error)]">*</span>
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
              className="flex items-center justify-center rounded-md border-2 border-[var(--color-border-brand)] bg-[var(--color-surface)] text-[var(--color-brand-primary)] hover:bg-[var(--color-hover-brand)] hover:text-[var(--color-brand-tertiary)] dark:border-[var(--color-border-brand)] dark:bg-[var(--color-brand-light)] dark:text-[var(--color-brand-text-light)] dark:hover:text-[var(--color-brand-text-light)] dark:hover:border-[var(--color-border-brand)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] dark:focus-visible:ring-[var(--color-brand-text-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-background [&:has([data-state=checked])]:bg-[var(--color-hover-brand)] [&:has([data-state=checked])]:border-[var(--color-brand-primary)] [&:has([data-state=checked])]:text-[var(--color-brand-primary)] dark:[&:has([data-state=checked])]:border-[var(--color-brand-primary)] dark:[&:has([data-state=checked])]:text-[var(--color-brand-primary)] p-1.5 sm:p-2 transition-all cursor-pointer"
            >
              <RadioGroupItem value={name} id={name} className="sr-only" />
              <Icon aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" />
            </Label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
