import { type ReactNode } from 'react';
import { Dialog, DialogContent } from '@shared/components/ui/dialog';

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
      <DialogContent className="border-(--color-border-brand) bg-(--color-brand-lighter) dark:border-(--color-border-secondary) mx-auto max-h-[90vh] w-[95vw] overflow-y-auto p-4 backdrop-blur-2xl backdrop-brightness-50 sm:max-w-3xl sm:p-6 dark:bg-transparent">
        {children}
      </DialogContent>
    </Dialog>
  );
}
