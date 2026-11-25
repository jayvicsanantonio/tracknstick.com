// Native-feeling iOS UISwitch toggle (51x31px) with spring-animated thumb & haptic feedback.

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@shared/utils/utils';
import { IOS_SPRING_CONTROL } from '@shared/utils/motion';
import { triggerHaptic, type HapticStyle } from '@shared/utils/haptics';

interface IosSwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
  /** Haptic style fired after toggling (pass false to silence). Defaults to 'selection'. */
  hapticStyle?: HapticStyle | false;
}

const IosSwitch = memo(function IosSwitch({
  id,
  checked,
  onCheckedChange,
  ariaLabel,
  disabled = false,
  hapticStyle = 'selection',
}: IosSwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        onCheckedChange(!checked);
        if (hapticStyle !== false) {
          triggerHaptic(hapticStyle);
        }
      }}
      className={cn(
        'relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? 'bg-(--color-brand-primary)'
          : 'bg-(--color-border-primary)/80 dark:bg-(--color-surface-tertiary)',
      )}
    >
      <motion.span
        layout
        transition={IOS_SPRING_CONTROL}
        animate={{ x: checked ? 20 : 0 }}
        className="pointer-events-none block size-[27px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.22),0_0_1px_rgba(0,0,0,0.1)]"
      />
    </button>
  );
});

export default IosSwitch;
