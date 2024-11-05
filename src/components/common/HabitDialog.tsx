import { type ReactNode, useContext } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ThemeContext } from "@/context/ThemeContext";

export default function HabitDialog({
  isOpen,
  toggleIsOpen,
  children,
}: {
  isOpen: boolean;
  toggleIsOpen: () => void;
  children: ReactNode;
}) {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <Dialog open={isOpen} onOpenChange={toggleIsOpen}>
      <DialogContent
        className={`sm:max-w-[525px] ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-purple-50 border-purple-200"
        }`}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
