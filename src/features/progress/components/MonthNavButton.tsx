import { Button } from '@shared/components/ui/button';

export default function MonthNavButton({
  onClick,
  children,
  ariaLabel,
}: {
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel: string;
}) {
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
}
