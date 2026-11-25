// Native-feeling iOS UISwitch toggle (51x31px) backed by a real `<input type="checkbox" switch>`
// so direct finger taps trigger Safari's Taptic Engine alongside spring thumb animation.

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@shared/utils/utils';
import { IOS_SPRING_CONTROL } from '@shared/utils/motion';
import { usePreferences } from '@shared/hooks/usePreferences';
import { triggerHaptic, type HapticStyle } from '@shared/utils/haptics';

interface IosSwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
  /** Haptic style fired after toggling (pass false to silence). Defaults to 'selection'. */
  hapticStyle?: HapticStyle | false;
  /**
   * Controls when Safari's native `switch` attribute is attached:
   * - `'whenEnabled'` (default): active whenever Haptic Feedback is enabled.
   * - `'onEnableOnly'`: active only when turning the switch ON (used for the
   *   Haptic Feedback master switch so turning it OFF stays silent while turning
   *   it back ON confirms with an immediate Taptic pulse).
   */
  nativeSwitchBehavior?: 'whenEnabled' | 'onEnableOnly';
}

const IosSwitch = memo(function IosSwitch({
  id,
  checked,
  onCheckedChange,
  ariaLabel,
  disabled = false,
  hapticStyle = 'selection',
  nativeSwitchBehavior = 'whenEnabled',
}: IosSwitchProps) {
  const { hapticsEnabled } = usePreferences();

  const nativeSwitchEnabled =
    !disabled &&
    hapticStyle !== false &&
    (nativeSwitchBehavior === 'onEnableOnly' ? !checked : hapticsEnabled);

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      if (!node) return;
      if (nativeSwitchEnabled) {
        node.setAttribute('switch', '');
      } else {
        node.removeAttribute('switch');
      }
    },
    [nativeSwitchEnabled],
  );

  return (
    <span
      className={cn(
        'relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-[2px] transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-(--color-ring) has-[:focus-visible]:ring-offset-2',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        checked
          ? 'bg-(--color-brand-primary)'
          : 'bg-(--color-border-primary)/80 dark:bg-(--color-surface-tertiary)',
      )}
    >
      <input
        ref={setInputRef}
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        onChange={(event) => {
          onCheckedChange(event.target.checked);
          if (hapticStyle !== false) {
            triggerHaptic(
              hapticStyle,
              nativeSwitchEnabled ? { iosNativeHandled: true } : undefined,
            );
          }
        }}
        className="absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0 [-webkit-tap-highlight-color:transparent] disabled:cursor-not-allowed"
      />
      <motion.span
        layout
        transition={IOS_SPRING_CONTROL}
        animate={{ x: checked ? 20 : 0 }}
        className="pointer-events-none block size-[27px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.22),0_0_1px_rgba(0,0,0,0.1)]"
      />
    </span>
  );
});

export default IosSwitch;
