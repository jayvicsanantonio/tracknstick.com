import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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
      <Label className="text-sm text-(--color-brand-text) sm:text-base dark:text-(--color-brand-text-light)">
        {label}
        <span className="text-(--color-error)">*</span>
      </Label>
      <div className="max-h-30 overflow-y-auto pb-1 sm:max-h-38">
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
              className="focus-visible:ring-offset-background flex cursor-pointer items-center justify-center rounded-md border-2 border-(--color-border-brand) bg-(--color-surface) p-1.5 text-(--color-brand-primary) transition-all hover:bg-(--color-hover-brand) hover:text-(--color-brand-tertiary) focus-visible:ring-2 focus-visible:ring-(--color-brand-primary) focus-visible:ring-offset-2 sm:p-2 dark:border-(--color-border-brand) dark:bg-(--color-brand-light) dark:text-(--color-brand-text-light) dark:hover:border-(--color-border-brand) dark:hover:text-(--color-brand-text-light) dark:focus-visible:ring-(--color-brand-text-light) [&:has([data-state=checked])]:border-(--color-brand-primary) [&:has([data-state=checked])]:bg-(--color-hover-brand) [&:has([data-state=checked])]:text-(--color-brand-primary) dark:[&:has([data-state=checked])]:border-(--color-brand-primary) dark:[&:has([data-state=checked])]:text-(--color-brand-primary)"
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
