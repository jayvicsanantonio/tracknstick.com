import { Button } from "@/components/ui/button";

export default function MonthNavButton({
  onClick,
  isDarkMode,
  children,
  ariaLabel,
}: {
  onClick: () => void;
  isDarkMode: boolean;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="icon"
      aria-label={ariaLabel}
      className={
        isDarkMode
          ? "border-purple-900 bg-purple-900/50 hover:bg-purple-800/60 text-purple-300"
          : "border-purple-300 hover:bg-purple-100"
      }
    >
      {children}
    </Button>
  );
}
