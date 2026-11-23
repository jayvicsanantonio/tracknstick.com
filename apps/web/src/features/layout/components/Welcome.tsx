// The signed-out landing page: what Track N' Stick offers and sign-in.
// Shares one unified open-canvas onboarding layout across phone, tablet, and desktop:
// bold hero headline, elevated tactile feature cards, and a clean Clerk sign-in stage.

import { SignIn } from '@clerk/clerk-react';
import { PAGE_CONTAINER } from '@shared/constants/layout';
import { useTheme } from '@shared/hooks/useTheme';
import { triggerHaptic } from '@shared/utils/haptics';
import { cn } from '@shared/utils/utils';
import { memo, useMemo } from 'react';
import {
  BarChart3,
  CalendarCheck2,
  Check,
  Moon,
  Sparkles,
  Sun,
  type LucideIcon,
} from 'lucide-react';

const FEATURES: { Icon: LucideIcon; title: string; detail: string }[] = [
  {
    Icon: CalendarCheck2,
    title: 'Check in daily',
    detail: 'Tap a habit to mark it done. Your streaks build themselves.',
  },
  {
    Icon: BarChart3,
    title: 'See your progress',
    detail: 'A calendar, completion trends and achievements to earn.',
  },
  {
    Icon: Sparkles,
    title: 'Ask the coach',
    detail: 'Advice grounded in Atomic Habits whenever you feel stuck.',
  },
];

const Welcome = memo(function Welcome() {
  const { mode, toggleMode } = useTheme();
  const isDark = mode === 'dark';

  const title = useMemo(
    () => (isDark ? 'Defy Gravity' : 'Sparkle Up'),
    [isDark],
  );
  const subtitle = useMemo(
    () =>
      isDark
        ? 'Build habits that stick. Calm, focused, and quietly powerful.'
        : 'Build habits that shine. Simple, friendly, and delightfully light.',
    [isDark],
  );

  return (
    <div className="flex flex-1 flex-col">
      {/* Native mobile signed-out top bar: compact app brand + appearance toggle */}
      <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-2 sm:hidden">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-[10px] bg-(--color-brand-primary) text-(--color-primary-foreground) shadow-sm"
          >
            <Check className="size-4" strokeWidth={3} />
          </span>
          <span className="text-[16px] font-bold tracking-tight text-(--color-foreground)">
            Track N&apos; Stick
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('selection');
            toggleMode();
          }}
          aria-label="Toggle Theme"
          className="ios-grouped-card flex size-10 items-center justify-center rounded-full text-(--color-brand-primary) active:scale-92"
        >
          <Sun aria-hidden="true" className="size-5 dark:hidden" />
          <Moon aria-hidden="true" className="hidden size-5 dark:block" />
        </button>
      </div>

      <div className="relative flex w-full flex-1 overflow-hidden">
        <div
          className={cn(
            PAGE_CONTAINER,
            'flex flex-1 flex-col justify-center pt-2 pb-[max(env(safe-area-inset-bottom),2rem)] sm:py-6 lg:py-10',
          )}
        >
          <div className="grid w-full items-center gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12 xl:gap-16">
            {/* Left Side - Hero Content & Tactile Feature Cards */}
            <div className="flex flex-col items-center px-1 pt-3 pb-2 text-center sm:px-0 sm:pt-0 lg:items-start lg:text-left">
              <div className="w-full max-w-xl">
                <h1 className="text-[36px] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance text-(--color-brand-primary) sm:text-5xl xl:text-6xl dark:text-(--color-brand-text-light)">
                  {title}
                </h1>
                <p className="mt-2.5 text-[15px] leading-relaxed text-balance text-(--color-brand-tertiary) sm:mt-4 sm:text-lg xl:text-xl dark:text-(--color-text-primary)">
                  {subtitle}
                </p>

                {/* Elevated onboarding feature cards consistent across phone, tablet, and desktop */}
                <ul
                  aria-label="What you get"
                  className="mt-5 grid grid-cols-1 gap-2.5 text-left sm:mt-7 sm:gap-3"
                >
                  {FEATURES.map(({ Icon, title: featureTitle, detail }) => (
                    <li
                      key={featureTitle}
                      className="ios-tracker-card flex flex-row items-center gap-3.5 rounded-[20px] p-3.5 sm:gap-4 sm:p-4"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset sm:size-12 sm:rounded-[15px]">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold tracking-[-0.01em] text-(--color-foreground) sm:text-base">
                          {featureTitle}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-(--color-text-secondary) sm:text-sm">
                          {detail}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mobile divider */}
            <div className="mx-4 h-px w-auto bg-(--color-border-primary)/60 sm:hidden" />

            {/* Right Side - Sign In Stage */}
            <div className="flex justify-center pt-1 pb-2 sm:p-0">
              <div className="ios-tracker-card-sm w-full max-w-sm sm:max-w-md sm:rounded-[26px] sm:p-7 lg:p-8">
                <div className="mb-3 text-center sm:mb-5">
                  <h2 className="text-[17px] font-bold tracking-[-0.015em] text-(--color-foreground) sm:text-xl">
                    Start Your Journey
                  </h2>
                  <p className="mt-0.5 text-[13px] text-(--color-text-secondary) sm:mt-1 sm:text-sm">
                    Transform intention into momentum
                  </p>
                </div>
                <SignIn
                  appearance={{
                    layout: {
                      socialButtonsPlacement: 'top',
                      socialButtonsVariant: 'blockButton',
                    },
                    variables: {
                      borderRadius: '0.875rem',
                      spacingUnit: '0.75rem',
                    },
                    elements: {
                      card: 'bg-transparent border-0 !shadow-none p-0 w-full max-w-none !border-0 !outline-0',
                      cardBox:
                        'bg-transparent border-0 !shadow-none p-0 w-full max-w-none !rounded-none !border-0 !outline-0',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      form: 'space-y-3 w-full',
                      formContainer: 'space-y-3 w-full',
                      formButtonPrimary:
                        'bg-(--color-brand-primary) hover:bg-(--color-brand-secondary) dark:bg-(--color-brand-secondary) dark:hover:bg-(--color-brand-primary) text-(--color-text-inverse) rounded-2xl font-semibold shadow-none transition-all duration-150 w-full min-h-[50px] py-3 px-4 text-base touch-manipulation active:scale-[0.98]',
                      formButtonSecondary:
                        'text-(--color-brand-primary) hover:text-(--color-brand-secondary) font-medium w-full min-h-[48px] py-3 px-4 text-base touch-manipulation',
                      socialButtonsBlockButton:
                        'bg-(--color-card) border border-(--color-border-primary) dark:border-white/20 hover:bg-(--color-hover-surface) rounded-2xl transition-all duration-150 text-(--color-foreground) dark:text-white !text-(--color-foreground) dark:!text-white !border-1 !border-solid min-h-[50px] py-3 px-4 shadow-none active:scale-[0.98] touch-manipulation flex items-center justify-center gap-2.5',
                      socialButtonsBlockButtonText:
                        'text-(--color-foreground) dark:text-white font-medium text-base',
                      socialButtonsIconButton:
                        'text-(--color-foreground) dark:text-white w-5 h-5 flex-shrink-0',
                      formFieldInput:
                        'bg-(--color-card) border border-(--color-border-primary) rounded-2xl focus:border-(--color-brand-primary) focus:ring-2 focus:ring-(--color-brand-primary)/20 text-(--color-foreground) dark:text-white placeholder:text-(--color-text-secondary) dark:placeholder:!text-gray-300 w-full min-h-[48px] py-3 px-4 text-base transition-all duration-150 touch-manipulation shadow-none',
                      formFieldLabel:
                        'text-(--color-foreground) dark:text-white font-medium text-sm mb-1.5 block',
                      formField: 'w-full space-y-1',
                      formFieldRow: 'w-full',
                      formFieldInputShowPasswordButton:
                        'text-(--color-text-secondary) dark:text-gray-400 hover:text-(--color-foreground) dark:hover:text-white p-3 min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation',
                      formFieldErrorText:
                        'text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1',
                      formFieldSuccessText:
                        'text-green-500 dark:text-green-400 text-xs sm:text-sm mt-1',
                      formFieldWarningText:
                        'text-orange-500 dark:text-orange-400 text-xs sm:text-sm mt-1',
                      formFieldAction:
                        'text-xs sm:text-sm text-(--color-brand-primary) hover:text-(--color-brand-secondary)',
                      formResendCodeLink:
                        'text-xs sm:text-sm text-(--color-brand-primary) hover:text-(--color-brand-secondary) underline',
                      dividerLine: 'bg-(--color-border-primary) my-3 sm:my-4',
                      dividerText: 'text-(--color-text-secondary) text-sm px-4',
                      otpCodeFieldInput:
                        'w-12 h-12 sm:w-14 sm:h-14 text-center text-base sm:text-lg font-semibold border border-(--color-border-primary) rounded-xl focus:border-(--color-brand-primary) focus:ring-2 focus:ring-(--color-brand-primary)/20 bg-(--color-card) touch-manipulation',
                      otpCodeFieldInputs: 'flex gap-2 sm:gap-3 justify-center',
                      alertText:
                        'text-sm p-3 sm:p-4 rounded-xl bg-(--color-surface) border border-(--color-border-primary)',
                      identityPreviewText:
                        'text-(--color-foreground) dark:text-white text-sm sm:text-base',
                      identityPreviewEditButton:
                        'text-(--color-brand-primary) hover:text-(--color-brand-secondary) text-sm min-h-[44px] flex items-center justify-center touch-manipulation',
                      footer:
                        'text-center mt-4 text-sm text-(--color-text-secondary)',
                      footerAction: 'text-sm text-(--color-text-secondary)',
                      footerActionText: 'text-sm text-(--color-text-secondary)',
                      footerActionLink:
                        'text-sm text-(--color-brand-primary) hover:text-(--color-brand-secondary) min-h-[44px] inline-flex items-center justify-center touch-manipulation',
                      spinner: 'w-5 h-5 sm:w-6 sm:h-6',
                      alternativeMethods: 'space-y-2 sm:space-y-3 mt-4',
                      alternativeMethodsBlockButton:
                        'w-full min-h-[48px] py-3 px-4 text-base rounded-2xl border border-(--color-border-primary) hover:bg-(--color-hover-surface) transition-all touch-manipulation active:scale-[0.98]',
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Welcome;
