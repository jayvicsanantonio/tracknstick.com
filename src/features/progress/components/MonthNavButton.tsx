import { Button } from "@/components/ui/button";

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
      className="border-[var(--color-border-brand)] hover:bg-[var(--color-hover-brand)] dark:border-[var(--color-border-brand)] dark:bg-[var(--color-brand-light)] dark:hover:bg-[var(--color-hover-brand)] dark:text-[var(--color-brand-text-light)]"
    >
      {children}
    </Button>
  );
}
