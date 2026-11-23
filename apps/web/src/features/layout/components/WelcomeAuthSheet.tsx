// The phone welcome page's bottom sheet holding Clerk's sign-up or sign-in form.
// Clerk routes its steps virtually, inside the sheet, and the sheet offers its own switch between the two.

import { memo } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { DialogDescription, DialogTitle } from '@shared/components/ui/dialog';
import IosSheet from '@shared/components/ui/ios-sheet';
import { triggerHaptic } from '@shared/utils/haptics';
import { clerkAuthSheetAppearance } from './clerkAuthAppearance';

export type WelcomeAuthMode = 'signUp' | 'signIn';

const COPY: Record<
  WelcomeAuthMode,
  { title: string; description: string; switchPrompt: string; switchTo: string }
> = {
  signUp: {
    title: 'Create your account',
    description: "Sign up to start tracking your habits with Track N' Stick.",
    switchPrompt: 'Already have an account?',
    switchTo: 'Sign in',
  },
  signIn: {
    title: 'Welcome back',
    description: 'Sign in to pick up your habits where you left them.',
    switchPrompt: "New to Track N' Stick?",
    switchTo: 'Sign up',
  },
};

interface WelcomeAuthSheetProps {
  open: boolean;
  mode: WelcomeAuthMode;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: WelcomeAuthMode) => void;
}

const WelcomeAuthSheet = memo(function WelcomeAuthSheet({
  open,
  mode,
  onOpenChange,
  onModeChange,
}: WelcomeAuthSheetProps) {
  const copy = COPY[mode];

  return (
    <IosSheet
      open={open}
      onOpenChange={onOpenChange}
      showMobileCloseButton
      header={
        <DialogTitle className="px-14 pb-1 text-center text-[17px] font-semibold tracking-tight text-(--color-foreground)">
          {copy.title}
        </DialogTitle>
      }
    >
      <DialogDescription className="sr-only">
        {copy.description}
      </DialogDescription>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        {mode === 'signUp' ? (
          <SignUp routing="virtual" appearance={clerkAuthSheetAppearance} />
        ) : (
          <SignIn routing="virtual" appearance={clerkAuthSheetAppearance} />
        )}

        <p className="mt-5 flex items-center justify-center gap-1 text-[15px] text-(--color-text-secondary)">
          {copy.switchPrompt}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onModeChange(mode === 'signUp' ? 'signIn' : 'signUp');
            }}
            className="inline-flex min-h-11 items-center px-1 font-semibold text-(--color-brand-primary) active:opacity-60"
          >
            {copy.switchTo}
          </button>
        </p>
      </div>
    </IosSheet>
  );
});

export default WelcomeAuthSheet;
