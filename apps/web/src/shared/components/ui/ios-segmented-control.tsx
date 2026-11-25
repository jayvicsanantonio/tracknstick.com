// Native iOS UISegmentedControl with a spring-sliding active pill thumb.

import { motion } from 'framer-motion';
import { cn } from '@shared/utils/utils';
import { IOS_SPRING_CONTROL } from '@shared/utils/motion';
import { triggerHaptic, type HapticStyle } from '@shared/utils/haptics';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface IosSegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  ariaLabel: string;
  className?: string;
  /** Haptic style fired after selecting a new option (pass false to silence). Defaults to 'selection'. */
  hapticStyle?: HapticStyle | false;
}

export default function IosSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  ariaLabel,
  className,
  hapticStyle = 'selection',
}: IosSegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'relative inline-flex w-full items-center rounded-xl bg-(--color-muted) p-[3px] ring-1 ring-(--color-border-primary)/45 ring-inset',
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => {
              if (!isSelected) {
                onChange(option.value);
                if (hapticStyle !== false) {
                  triggerHaptic(hapticStyle);
                }
              }
            }}
            className={cn(
              'relative z-10 flex h-9 flex-1 cursor-pointer items-center justify-center rounded-[9px] px-2.5 text-[13px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring)',
              isSelected
                ? 'text-(--color-foreground)'
                : 'text-(--color-text-secondary)',
            )}
          >
            {isSelected ? (
              <motion.span
                layoutId={layoutId}
                transition={IOS_SPRING_CONTROL}
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-[9px] bg-(--color-surface) shadow-[0_1px_4px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.04)] dark:bg-(--color-surface-tertiary)"
              />
            ) : null}
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
