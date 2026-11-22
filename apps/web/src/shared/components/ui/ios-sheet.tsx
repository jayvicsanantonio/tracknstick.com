// Native iOS interactive modal sheet built on Radix Dialog + Framer Motion.
// On phones (< sm): slides up from the bottom edge, supports real velocity-based
// swipe-down-to-dismiss via the grabber/header handle, and scales the underlying
// app shell back (iOS pageSheet effect). On wider screens: renders a centered dialog.

import { memo, Suspense, type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, useDragControls, type PanInfo } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '@shared/utils/utils';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import { useIosSheetScale } from '@shared/hooks/useIosSheetScale';
import { IOS_SPRING_SHEET } from '@shared/utils/motion';
import { triggerHaptic } from '@shared/utils/haptics';

interface IosSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional custom header rendered inside the draggable top region on mobile. */
  header?: ReactNode;
  /** Whether to show the corner X close button on mobile (default false when a top Cancel/Done header is provided). */
  showMobileCloseButton?: boolean;
  /** Extra classes applied to the sheet surface. */
  className?: string;
  children: ReactNode;
}

const DISMISS_OFFSET = 110;
const DISMISS_VELOCITY = 480;

const IosSheet = memo(function IosSheet({
  open,
  onOpenChange,
  header,
  showMobileCloseButton = false,
  className,
  children,
}: IosSheetProps) {
  const isMobile = useIsMobile();
  const dragControls = useDragControls();

  useIosSheetScale(open && isMobile);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
      triggerHaptic('light');
      onOpenChange(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {/* Wait for any lazy child (such as HabitForm) before mounting the sheet so it
          opens at its full final height in one paint without shifting layout. */}
      <Suspense fallback={null}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            asChild
            onOpenAutoFocus={(event) => {
              // Avoid immediately popping the mobile keyboard or focusing the close X.
              if (isMobile) event.preventDefault();
            }}
          >
            <motion.div
              drag={isMobile ? 'y' : false}
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.06, bottom: 0.55 }}
              onDragEnd={handleDragEnd}
              initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.96 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
              transition={IOS_SPRING_SHEET}
              className={cn(
                'ios-action-sheet-surface fixed z-50 flex flex-col overflow-hidden text-(--color-card-foreground) outline-none',
                // Mobile: bottom-anchored draggable iOS sheet
                'max-sm:inset-x-0 max-sm:bottom-0 max-sm:max-h-[92dvh] max-sm:w-full max-sm:rounded-t-[28px] max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0',
                // Tablet & desktop: centered frosted modal matching phone sheets
                'sm:top-1/2 sm:left-1/2 sm:max-h-[90dvh] sm:w-[95vw] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[26px] sm:p-6',
                className,
              )}
            >
              {/* Interactive drag handle + mobile top bar region */}
              <div
                onPointerDown={(event) => {
                  if (isMobile) dragControls.start(event);
                }}
                className="shrink-0 touch-none max-sm:pt-2.5"
              >
                <div
                  aria-hidden="true"
                  className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-(--color-border-brand)/75 sm:hidden"
                />
                {header}
              </div>

              {children}

              <DialogPrimitive.Close
                className={cn(
                  'absolute top-4 right-4 flex size-9 items-center justify-center rounded-full text-(--color-text-secondary) opacity-80 transition-opacity hover:opacity-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-(--color-ring)',
                  !showMobileCloseButton && 'max-sm:hidden',
                  showMobileCloseButton &&
                    'max-sm:top-3 max-sm:right-3 max-sm:size-11',
                )}
              >
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </Suspense>
    </DialogPrimitive.Root>
  );
});

export default IosSheet;
