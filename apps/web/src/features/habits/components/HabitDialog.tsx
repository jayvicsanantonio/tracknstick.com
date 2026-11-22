// Shell of the Add and Edit habit dialogs: a centered modal on wider screens, an iOS-style sheet on phones.
// The caller supplies the title and the form; the sheet can be dragged down to close.

import { type ReactNode, memo, Suspense } from 'react';
import { Drawer } from 'vaul';
import { XIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@shared/components/ui/dialog';
import { useIsPhone } from '@shared/hooks/useIsPhone';

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
  const isPhone = useIsPhone();

  if (isPhone) {
    return (
      <HabitSheet isOpen={isOpen} toggleIsOpen={toggleIsOpen}>
        {children}
      </HabitSheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleIsOpen}>
      {/* The form loads the first time a dialog opens. Waiting for it here,
          around the whole dialog, opens the dialog complete instead of
          opening it short and growing it once the form arrives. */}
      <Suspense fallback={null}>
        {/* The dialog itself never scrolls: it is a column whose title and
            buttons hold still while the form's fields scroll between them. */}
        <DialogContent className="mx-auto flex max-h-[90dvh] w-[95vw] flex-col overflow-hidden border-(--color-border-brand) bg-(--color-brand-lighter) p-4 backdrop-blur-2xl backdrop-brightness-50 sm:max-w-3xl sm:p-6 dark:border-(--color-border-secondary) dark:bg-transparent">
          {children}
        </DialogContent>
      </Suspense>
    </Dialog>
  );
});

/**
 * The phone's form of the dialog, as an iOS sheet: it rises from the bottom
 * edge, follows the finger when dragged by its grabber or title and closes
 * when let go far or fast enough, and the page behind it shrinks back.
 * Fields scrolled to their top hand a further downward drag to the sheet.
 */
function HabitSheet({ isOpen, toggleIsOpen, children }: HabitDialogProps) {
  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={toggleIsOpen}
      shouldScaleBackground
    >
      <Drawer.Portal>
        {/* As in the dialog above: wait for the form, then open complete. */}
        <Suspense fallback={null}>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col gap-3 rounded-t-3xl border-t border-(--color-border-brand) bg-(--color-brand-lighter) px-4 pt-3 text-(--color-card-foreground) outline-none dark:border-(--color-border-secondary) dark:bg-(--color-surface-secondary)">
            <Drawer.Handle className="!h-1.5 !w-10 shrink-0 !bg-(--color-border-brand)" />
            {children}
            <Drawer.Close className="absolute top-2 right-2 flex size-11 items-center justify-center rounded-full opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-(--color-ring)">
              <XIcon className="size-4" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </Drawer.Close>
          </Drawer.Content>
        </Suspense>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default HabitDialog;
