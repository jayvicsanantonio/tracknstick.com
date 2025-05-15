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
        className={`w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-auto sm:max-w-3xl ${
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
