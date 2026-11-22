// The signed-out landing page: what Track N' Stick offers and sign-in.
// On phones (< sm): full-bleed native iOS onboarding with app icon, feature rows,
// quick theme toggle, and clean Clerk sign-in. From sm/lg up: keeps the split glass card.

import { SignIn } from '@clerk/clerk-react';
import { Card } from '@shared/components/ui/card';
import { useTheme } from '@shared/hooks/useTheme';
import { triggerHaptic } from '@shared/utils/haptics';
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
        {/* Desktop background glows (hidden on phones for 120Hz performance) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 hidden sm:block"
        >
          <div className="absolute top-0 left-20 h-80 w-80 -translate-y-20 rounded-full bg-(--color-brand-light) opacity-20 blur-3xl" />
          <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-(--color-accent) opacity-20 blur-3xl" />
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 pt-2 pb-[max(env(safe-area-inset-bottom),2rem)] sm:min-h-[calc(100dvh-8rem)] sm:px-4 sm:py-6 lg:px-8 lg:py-12 2xl:max-w-[90rem]">
          <Card
            variant="glass"
            className="relative w-full max-w-7xl overflow-hidden max-sm:rounded-none max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:ring-0 max-sm:backdrop-blur-none sm:rounded-3xl 2xl:max-w-[90rem] dark:max-sm:bg-transparent"
          >
            <div className="flex min-h-full w-full flex-col items-stretch lg:flex-row lg:items-center">
              {/* Left Side - Hero Content */}
              <div className="relative flex flex-1 flex-col items-center justify-center px-1 pt-3 pb-4 text-center sm:p-8 lg:items-start lg:p-12 lg:text-left xl:p-16">
                <div className="z-10 w-full max-w-xl">
                  <h1 className="text-[36px] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance text-(--color-brand-primary) sm:text-5xl xl:text-6xl dark:text-(--color-brand-text-light)">
                    {title}
                  </h1>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-balance text-(--color-brand-tertiary) sm:mt-4 sm:text-lg xl:text-xl dark:text-(--color-text-primary)">
                    {subtitle}
                  </p>

                  {/* Apple onboarding-style vertical feature rows on mobile; spacious list on desktop */}
                  <ul
                    aria-label="What you get"
                    className="mt-5 grid grid-cols-1 gap-2.5 text-left sm:mt-6 sm:grid-cols-3 sm:gap-3 sm:text-center lg:mt-10 lg:grid-cols-1 lg:gap-6 lg:text-left"
                  >
                    {FEATURES.map(({ Icon, title: featureTitle, detail }) => (
                      <li
                        key={featureTitle}
                        className="ios-grouped-card flex flex-row items-center gap-3.5 rounded-2xl p-3.5 sm:flex-col sm:items-center sm:gap-2 sm:border-0 sm:bg-(--color-surface)/60 sm:p-3 sm:shadow-none sm:ring-1 sm:ring-(--color-border-primary)/50 sm:ring-inset lg:flex-row lg:items-start lg:gap-4 lg:bg-transparent lg:p-0 lg:ring-0 dark:sm:bg-(--color-surface-secondary)/60 lg:dark:bg-transparent"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--color-brand-primary)/12 text-(--color-brand-primary)">
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[15px] font-semibold text-(--color-foreground) sm:text-sm lg:text-base">
                            {featureTitle}
                          </span>
                          <span className="block text-[13px] leading-snug text-(--color-text-secondary) sm:hidden lg:block lg:text-sm">
                            {detail}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-4 my-2 h-px w-auto bg-(--color-border-primary)/60 sm:mx-12 sm:my-4 lg:mx-0 lg:my-12 lg:h-auto lg:w-px lg:self-stretch" />

              {/* Right Side - Sign In Form */}
              <div className="flex flex-1 justify-center pt-3 pb-2 sm:p-6 sm:pb-12 lg:p-12">
                <div className="w-full max-w-sm sm:w-auto">
                  <div className="mb-3 text-center sm:mb-4">
                    <h2 className="text-[17px] font-semibold tracking-tight text-(--color-brand-tertiary) sm:text-lg dark:text-(--color-brand-text-light)">
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
                          'bg-transparent border-0 !shadow-none p-0 w-full max-w-none !rounded-none !border-0 !outline-0 sm:!shadow-md sm:!rounded-3xl sm:!border-1',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                        form: 'space-y-3 w-full',
                        formContainer: 'space-y-3 w-full',
                        formButtonPrimary:
                          'bg-(--color-brand-primary) hover:bg-(--color-brand-secondary) dark:bg-(--color-brand-secondary) dark:hover:bg-(--color-brand-primary) text-(--color-text-inverse) rounded-2xl sm:rounded-xl font-semibold shadow-none sm:shadow-lg transition-all duration-150 w-full min-h-[50px] sm:min-h-[52px] py-3 sm:py-4 px-4 sm:px-6 text-base touch-manipulation active:scale-[0.98]',
                        formButtonSecondary:
                          'text-(--color-brand-primary) hover:text-(--color-brand-secondary) font-medium w-full min-h-[48px] py-3 px-4 text-base touch-manipulation',
                        socialButtonsBlockButton:
                          'bg-(--color-card) border border-(--color-border-primary) dark:border-white/30 hover:bg-(--color-surface-hover) rounded-2xl sm:rounded-xl transition-all duration-150 text-(--color-foreground) dark:text-white !text-(--color-foreground) dark:!text-white !border-1 !border-solid min-h-[50px] sm:min-h-[52px] py-3 sm:py-4 px-4 sm:px-6 shadow-none sm:shadow-sm active:scale-[0.98] touch-manipulation flex items-center justify-center gap-2 sm:gap-3',
                        socialButtonsBlockButtonText:
                          'text-(--color-foreground) dark:text-white font-medium text-base',
                        socialButtonsIconButton:
                          'text-(--color-foreground) dark:text-white w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0',
                        formFieldInput:
                          'bg-(--color-card) border border-(--color-border-primary) sm:border-2 rounded-2xl sm:rounded-xl focus:border-(--color-brand-primary) focus:ring-2 focus:ring-(--color-brand-primary)/20 text-(--color-foreground) dark:text-white placeholder:text-(--color-text-secondary) dark:placeholder:!text-gray-300 w-full min-h-[48px] sm:min-h-[52px] py-3 sm:py-4 px-4 text-base transition-all duration-150 touch-manipulation shadow-none sm:shadow-sm',
                        formFieldLabel:
                          'text-(--color-foreground) dark:text-white font-medium text-sm sm:text-base mb-1.5 block',
                        formField: 'w-full space-y-1 sm:space-y-2',
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
                        dividerText:
                          'text-(--color-text-secondary) text-sm px-4',
                        otpCodeFieldInput:
                          'w-12 h-12 sm:w-14 sm:h-14 text-center text-base sm:text-lg font-semibold border border-(--color-border-primary) sm:border-2 rounded-xl focus:border-(--color-brand-primary) focus:ring-2 focus:ring-(--color-brand-primary)/20 bg-(--color-card) touch-manipulation',
                        otpCodeFieldInputs:
                          'flex gap-2 sm:gap-3 justify-center',
                        alertText:
                          'text-sm p-3 sm:p-4 rounded-xl bg-(--color-surface) border border-(--color-border-primary)',
                        identityPreviewText:
                          'text-(--color-foreground) dark:text-white text-sm sm:text-base',
                        identityPreviewEditButton:
                          'text-(--color-brand-primary) hover:text-(--color-brand-secondary) text-sm min-h-[44px] flex items-center justify-center touch-manipulation',
                        footer:
                          'text-center mt-4 text-sm text-(--color-text-secondary)',
                        footerAction: 'text-sm text-(--color-text-secondary)',
                        footerActionText:
                          'text-sm text-(--color-text-secondary)',
                        footerActionLink:
                          'text-sm text-(--color-brand-primary) hover:text-(--color-brand-secondary) min-h-[44px] inline-flex items-center justify-center touch-manipulation',
                        spinner: 'w-5 h-5 sm:w-6 sm:h-6',
                        alternativeMethods: 'space-y-2 sm:space-y-3 mt-4',
                        alternativeMethodsBlockButton:
                          'w-full min-h-[48px] sm:min-h-[52px] py-3 sm:py-4 px-4 sm:px-6 text-base rounded-2xl sm:rounded-xl border border-(--color-border-primary) hover:bg-(--color-surface-hover) transition-all touch-manipulation active:scale-[0.98]',
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
});

export default Welcome;
