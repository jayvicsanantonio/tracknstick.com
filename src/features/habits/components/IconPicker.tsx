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
      <Label className="text-sm text-[var(--color-brand-text)] sm:text-base dark:text-[var(--color-brand-text-light)]">
        {label}
        <span className="text-[var(--color-error)]">*</span>
      </Label>
      <div className="max-h-[7.5rem] overflow-y-auto pb-1 sm:max-h-[9.5rem]">
        <RadioGroup
          className="grid grid-cols-5 gap-1.5 sm:grid-cols-7 sm:gap-2 md:grid-cols-9"
          value={selectedIcon}
          onValueChange={(value) => {
            onIconChange(value as keyof typeof HabitsIcons);
          }}
        >
          {Object.entries(HabitsIcons).map(([name, Icon]) => (
            <Label
              key={name}
              className="focus-visible:ring-offset-background flex cursor-pointer items-center justify-center rounded-md border-2 border-[var(--color-border-brand)] bg-[var(--color-surface)] p-1.5 text-[var(--color-brand-primary)] transition-all hover:bg-[var(--color-hover-brand)] hover:text-[var(--color-brand-tertiary)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 sm:p-2 dark:border-[var(--color-border-brand)] dark:bg-[var(--color-brand-light)] dark:text-[var(--color-brand-text-light)] dark:hover:border-[var(--color-border-brand)] dark:hover:text-[var(--color-brand-text-light)] dark:focus-visible:ring-[var(--color-brand-text-light)] [&:has([data-state=checked])]:border-[var(--color-brand-primary)] [&:has([data-state=checked])]:bg-[var(--color-hover-brand)] [&:has([data-state=checked])]:text-[var(--color-brand-primary)] dark:[&:has([data-state=checked])]:border-[var(--color-brand-primary)] dark:[&:has([data-state=checked])]:text-[var(--color-brand-primary)]"
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
