// Shell of the Add and Edit habit dialogs: a centered modal on wider screens,
// an interactive swipe-to-dismiss iOS sheet with background scale-down on phones.

import { type ReactNode, memo } from 'react';
import IosSheet from '@shared/components/ui/ios-sheet';

interface HabitDialogProps {
  isOpen: boolean;
  toggleIsOpen: () => void;
  /** Optional mobile iOS top bar (Cancel / Title / Add or Save) inside the draggable handle. */
  mobileHeader?: ReactNode;
  children: ReactNode;
}

const HabitDialog = memo(function HabitDialog({
  isOpen,
  toggleIsOpen,
  mobileHeader,
  children,
}: HabitDialogProps) {
  return (
    <IosSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (open !== isOpen) toggleIsOpen();
      }}
      header={mobileHeader}
      showMobileCloseButton={!mobileHeader}
    >
      {children}
    </IosSheet>
  );
});

export default HabitDialog;
