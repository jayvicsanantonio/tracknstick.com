// A round button that moves the progress calendar back or forward a month.
// Quiet until hovered, so the month's name leads the calendar's header.

import { memo, ReactNode } from 'react';
import { Button } from '@shared/components/ui/button';

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
    <Button
      onClick={onClick}
      variant="ghost"
      size="icon"
      aria-label={ariaLabel}
      disabled={disabled}
      className="size-11 rounded-full text-(--color-text-secondary) hover:bg-(--color-brand-primary)/10 hover:text-(--color-foreground) sm:size-9"
    >
      {children}
    </Button>
  );
});

export default MonthNavButton;
