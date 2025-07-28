import { RadioGroup, RadioGroupItem } from '@shared/components/ui/radio-group';
import { Label } from '@shared/components/ui/label';
import HabitsIcons from '@/icons/habits';

interface IconPickerProps {
  selectedIcon: keyof typeof HabitsIcons | undefined;
  onIconChange: (icon: keyof typeof HabitsIcons) => void;
  label?: string;
}

export default function IconPicker({
  selectedIcon,
  onIconChange,
  label = 'Icon',
}: IconPickerProps) {
  return (
    <div className="space-y-1 sm:space-y-2">
      <Label className="text-(--color-brand-text) dark:text-(--color-brand-text-light) text-sm sm:text-base">
        {label}
        <span className="text-(--color-error)">*</span>
      </Label>
      <div className="max-h-30 sm:max-h-38 overflow-y-auto pb-1">
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
              className="focus-visible:ring-offset-background border-(--color-border-brand) bg-(--color-surface) text-(--color-brand-primary) hover:bg-(--color-hover-brand) hover:text-(--color-brand-tertiary) focus-visible:ring-(--color-brand-primary) dark:border-(--color-border-brand) dark:bg-(--color-brand-light) dark:text-(--color-brand-text-light) dark:hover:border-(--color-border-brand) dark:hover:text-(--color-brand-text-light) dark:focus-visible:ring-(--color-brand-text-light) [&:has([data-state=checked])]:border-(--color-brand-primary) [&:has([data-state=checked])]:bg-(--color-hover-brand) [&:has([data-state=checked])]:text-(--color-brand-primary) dark:[&:has([data-state=checked])]:border-(--color-brand-primary) dark:[&:has([data-state=checked])]:text-(--color-brand-primary) flex cursor-pointer items-center justify-center rounded-md border-2 p-1.5 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 sm:p-2"
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
