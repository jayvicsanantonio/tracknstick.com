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
          ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-white"
          : "border-purple-300 hover:bg-purple-100"
      }
    >
      {children}
    </Button>
  );
}
