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
      className="border-purple-300 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-900/50 dark:hover:bg-purple-800/60 dark:text-purple-300"
    >
      {children}
    </Button>
  );
}
