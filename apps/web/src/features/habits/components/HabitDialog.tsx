// Shell of the Add and Edit habit dialogs: a centered modal on wider screens, a bottom sheet on phones.
// The caller supplies the title and the form.

import { type ReactNode, memo, Suspense } from 'react';
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
      {/* The form loads the first time a dialog opens. Waiting for it here,
          around the whole dialog, opens the dialog complete instead of
          opening it short and growing it once the form arrives. */}
      <Suspense fallback={null}>
        {/* Below sm the dialog is a bottom sheet: full width, anchored to the
            bottom edge, sliding up. The dialog itself never scrolls: it is a
            column whose title and buttons hold still while the form's fields
            scroll between them. */}
        <DialogContent className="mx-auto flex max-h-[90dvh] w-[95vw] flex-col overflow-hidden border-(--color-border-brand) bg-(--color-brand-lighter) p-4 backdrop-blur-2xl backdrop-brightness-50 max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:max-h-[92dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:gap-3 max-sm:rounded-t-3xl max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:pt-3 max-sm:pb-0 max-sm:data-[state=closed]:slide-out-to-bottom-full max-sm:data-[state=closed]:zoom-out-100 max-sm:data-[state=open]:slide-in-from-bottom-full max-sm:data-[state=open]:zoom-in-100 sm:max-w-3xl sm:p-6 dark:border-(--color-border-secondary) dark:bg-transparent max-sm:dark:bg-(--color-surface-secondary)/95">
          <div
            aria-hidden="true"
            className="mx-auto h-1.5 w-10 shrink-0 rounded-full bg-(--color-border-brand) sm:hidden"
          />
          {children}
        </DialogContent>
      </Suspense>
    </Dialog>
  );
});

export default HabitDialog;
