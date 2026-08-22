import { type ReactNode, memo } from 'react';
import { Dialog, DialogContent } from '@shared/components/ui/dialog';

interface HabitDialogProps {
  isOpen: boolean;
  toggleIsOpen: () => void;
  children: ReactNode;
}

const HabitDialog = memo(function HabitDialog({
  isOpen,
  toggleIsOpen,
  children,
}: HabitDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={toggleIsOpen}>
      <DialogContent className="mx-auto max-h-[90vh] w-[95vw] overflow-y-auto border-(--color-border-brand) bg-(--color-brand-lighter) p-4 backdrop-blur-2xl backdrop-brightness-50 sm:max-w-3xl sm:p-6 dark:border-(--color-border-secondary) dark:bg-transparent">
        {children}
      </DialogContent>
    </Dialog>
  );
});

export default HabitDialog;
