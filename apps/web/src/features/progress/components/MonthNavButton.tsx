// A round button that moves the progress calendar back or forward a month.
// Quiet until hovered, so the month's name leads the calendar's header.

import { memo, ReactNode } from 'react';
import { Button } from '@shared/components/ui/button';
import { IosHapticTarget } from '@shared/components/ui/ios-haptic-target';

interface MonthNavButtonProps {
  onClick: () => void;
  children: ReactNode;
  ariaLabel: string;
  disabled?: boolean;
}

const MonthNavButton = memo(function MonthNavButton({
  onClick,
  children,
  ariaLabel,
  disabled = false,
}: MonthNavButtonProps) {
  return (
    <IosHapticTarget disabled={disabled} className="inline-flex rounded-xl">
      <Button
        onClick={onClick}
        variant="ghost"
        size="icon"
        aria-label={ariaLabel}
        disabled={disabled}
        className="size-9 rounded-xl bg-(--color-brand-primary)/10 text-(--color-brand-primary) transition-[transform,background-color] hover:bg-(--color-brand-primary)/18 hover:text-(--color-brand-primary) active:scale-92 disabled:opacity-35"
      >
        {children}
      </Button>
    </IosHapticTarget>
  );
});

export default MonthNavButton;
