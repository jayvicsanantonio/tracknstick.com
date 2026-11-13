import { memo, ReactNode } from 'react';
import { Button } from '@shared/components/ui/button';

interface MonthNavButtonProps {
  onClick: () => void;
  children: ReactNode;
  ariaLabel: string;
}

const MonthNavButton = memo(function MonthNavButton({
  onClick,
  children,
  ariaLabel,
}: MonthNavButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="icon"
      aria-label={ariaLabel}
      className="border-(--color-border-brand) hover:bg-(--color-hover-brand) dark:border-(--color-border-brand) dark:bg-(--color-brand-light) dark:text-(--color-brand-text-light) dark:hover:bg-(--color-hover-brand)"
    >
      {children}
    </Button>
  );
});

export default MonthNavButton;
