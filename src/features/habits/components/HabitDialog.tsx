import { type ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function HabitDialog({
  isOpen,
  toggleIsOpen,
  children,
}: {
  isOpen: boolean;
  toggleIsOpen: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={toggleIsOpen}>
      <DialogContent className="mx-auto max-h-[90vh] w-[95vw] overflow-y-auto border-[var(--color-border-brand)] bg-[var(--color-brand-lighter)] p-4 sm:max-w-3xl sm:p-6 dark:border-[var(--color-border-secondary)] dark:bg-[var(--color-surface-secondary)]">
        {children}
      </DialogContent>
    </Dialog>
  );
}
