import { type ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function HabitDialog({
  isDarkMode,
  isOpen,
  toggleIsOpen,
  children,
}: {
  isDarkMode: boolean;
  isOpen: boolean;
  toggleIsOpen: () => void;
  children: ReactNode;
}) {
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
