// The signed-out landing page: what Track N' Stick offers and sign-in.
// Stacks on small screens and splits hero and sign-in side by side from lg up.

import { SignIn } from '@clerk/clerk-react';
import { Card } from '@shared/components/ui/card';
import { useTheme } from '@shared/hooks/useTheme';
import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';
import {
  BarChart3,
  CalendarCheck2,
  Sparkles,
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
  const { mode } = useTheme();
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
    <div className="flex-1">
      <div className="relative flex w-full flex-1 overflow-hidden">
        {/* Background Elements */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-20 h-80 w-80 -translate-y-20 rounded-full bg-(--color-brand-light) opacity-20 blur-3xl" />
          <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-(--color-accent) opacity-20 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-7xl flex-col items-center justify-center px-1 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-12 2xl:max-w-[90rem]"
        >
          <Card
            variant="glass"
            className="relative w-full max-w-7xl overflow-hidden rounded-2xl sm:rounded-3xl 2xl:max-w-[90rem]"
          >
            <div className="flex min-h-full w-full flex-col items-stretch lg:flex-row lg:items-center">
              {/* Left Side - Hero Content */}
              <div className="relative flex flex-1 flex-col items-center justify-center px-4 pt-6 pb-2 text-center sm:p-8 lg:items-start lg:p-12 lg:text-left xl:p-16">
                <div className="z-10 w-full max-w-xl">
                  <h1 className="text-4xl font-extrabold tracking-tight text-balance text-(--color-brand-primary) sm:text-5xl xl:text-6xl dark:text-(--color-brand-text-light)">
                    {title}
                  </h1>
                  <p className="mt-3 text-base leading-relaxed text-balance text-(--color-brand-tertiary) sm:mt-4 sm:text-lg xl:text-xl dark:text-(--color-text-primary)">
                    {subtitle}
                  </p>

                  <ul
                    aria-label="What you get"
                    className="mt-6 grid grid-cols-3 gap-2 text-center sm:gap-3 lg:mt-10 lg:grid-cols-1 lg:gap-6 lg:text-left"
                  >
                    {FEATURES.map(({ Icon, title: featureTitle, detail }) => (
                      <li
                        key={featureTitle}
                        className="flex flex-col items-center gap-2 rounded-2xl bg-(--color-surface)/60 p-3 ring-1 ring-(--color-border-primary)/50 ring-inset lg:flex-row lg:items-start lg:gap-4 lg:bg-transparent lg:p-0 lg:ring-0 dark:bg-(--color-surface-secondary)/60 lg:dark:bg-transparent"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--color-brand-primary)/12 text-(--color-brand-primary)">
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block text-xs font-semibold text-(--color-foreground) sm:text-sm lg:text-base">
                            {featureTitle}
                          </span>
                          <span className="hidden text-sm text-(--color-text-secondary) lg:block">
                            {detail}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-8 my-3 h-px w-auto bg-(--color-border-primary) sm:mx-12 sm:my-4 lg:mx-0 lg:my-12 lg:h-auto lg:w-px lg:self-stretch" />

              {/* Right Side - Sign In Form */}
              <div className="flex flex-1 justify-center pt-2 pb-4 sm:p-6 sm:pb-12 lg:p-12">
                <div>
                  <div className="mb-3 text-center sm:mb-4">
                    <h2 className="text-base font-semibold text-(--color-brand-tertiary) sm:text-lg dark:text-(--color-brand-text-light)">
                      Start Your Journey
                    </h2>
                    <p className="mt-1 text-xs text-(--color-text-secondary) sm:text-sm">
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
                        borderRadius: '0.75rem',
                        spacingUnit: '0.75rem',
                      },
                      elements: {
                        // Main card container
                        card: 'bg-transparent border-0 !shadow-none p-0 w-full max-w-none !border-0 !outline-0',
                        cardBox:
                          'bg-transparent border-0 !shadow-none p-0 w-full max-w-none !rounded-none !border-0 !outline-0 xs:!shadow-md xs:!rounded-3xl xs:!border-1',

                        // Header elements (hidden for cleaner mobile experience)
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',

                        // Form container for better mobile spacing
                        form: 'space-y-3 w-full',
                        formContainer: 'space-y-3 w-full',

                        // Primary action button (Sign In)
                        formButtonPrimary:
                          'bg-(--color-brand-primary) hover:bg-(--color-brand-secondary) dark:bg-(--color-brand-secondary) dark:hover:bg-(--color-brand-primary) text-(--color-text-inverse) rounded-lg sm:rounded-xl font-semibold shadow-none sm:shadow-lg transition-all duration-200 w-full min-h-[48px] sm:min-h-[52px] py-3 sm:py-4 px-4 sm:px-6 text-base touch-manipulation active:scale-[0.98] hover:shadow-none sm:hover:shadow-xl',

                        // Secondary buttons (forgot password, etc.)
                        formButtonSecondary:
                          'text-(--color-brand-primary) hover:text-(--color-brand-secondary) font-medium w-full min-h-[48px] py-3 px-4 text-base touch-manipulation',

                        // Social sign-in buttons
                        socialButtonsBlockButton:
                          'bg-(--color-card) border border-(--color-border-primary) dark:border-white hover:bg-(--color-surface-hover) rounded-lg sm:rounded-xl transition-all duration-200 text-(--color-foreground) dark:text-white !text-(--color-foreground) dark:!text-white !border-1 dark:!border-white !border-solid min-h-[48px] sm:min-h-[52px] py-3 sm:py-4 px-4 sm:px-6 shadow-none sm:shadow-sm hover:shadow-none sm:hover:shadow-md active:scale-[0.98] touch-manipulation flex items-center justify-center gap-2 sm:gap-3',
                        socialButtonsBlockButtonText:
                          'text-(--color-foreground) dark:text-white font-medium text-base',

                        socialButtonsIconButton:
                          'text-(--color-foreground) dark:text-white w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0',

                        // Form inputs
                        formFieldInput:
                          'bg-(--color-card) border border-(--color-border-primary) sm:border-2 rounded-lg sm:rounded-xl focus:border-(--color-brand-primary) focus:ring-1 sm:focus:ring-2 focus:ring-(--color-brand-primary)/20 text-(--color-foreground) dark:text-white placeholder:text-(--color-text-secondary) dark:placeholder:!text-gray-300 w-full min-h-[48px] sm:min-h-[52px] py-3 sm:py-4 px-4 text-base text-center transition-all duration-200 touch-manipulation shadow-none sm:shadow-sm focus:shadow-none sm:focus:shadow-md',

                        // Form field labels
                        formFieldLabel:
                          'text-(--color-foreground) dark:text-white font-medium text-sm sm:text-base mb-2 block',

                        // Form field containers for proper spacing
                        formField: 'w-full space-y-1 sm:space-y-2',
                        formFieldRow: 'w-full',

                        // Password field specific styling
                        formFieldInputShowPasswordButton:
                          'text-(--color-text-secondary) dark:text-gray-400 hover:text-(--color-foreground) dark:hover:text-white p-3 min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation',

                        // Error and success messages
                        formFieldErrorText:
                          'text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1',
                        formFieldSuccessText:
                          'text-green-500 dark:text-green-400 text-xs sm:text-sm mt-1',
                        formFieldWarningText:
                          'text-orange-500 dark:text-orange-400 text-xs sm:text-sm mt-1',

                        // Links and actions
                        formFieldAction:
                          'text-xs sm:text-sm text-(--color-brand-primary) hover:text-(--color-brand-secondary)',
                        formResendCodeLink:
                          'text-xs sm:text-sm text-(--color-brand-primary) hover:text-(--color-brand-secondary) underline',

                        // Divider styling
                        dividerLine: 'bg-(--color-border-primary) my-3 sm:my-4',
                        dividerText:
                          'text-(--color-text-secondary) text-sm px-4',

                        // OTP/Code inputs for 2FA
                        otpCodeFieldInput:
                          'w-12 h-12 sm:w-14 sm:h-14 text-center text-base sm:text-lg font-semibold border border-(--color-border-primary) sm:border-2 rounded-lg sm:rounded-xl focus:border-(--color-brand-primary) focus:ring-1 sm:focus:ring-2 focus:ring-(--color-brand-primary)/20 bg-(--color-card) shadow-none sm:shadow-sm touch-manipulation',

                        otpCodeFieldInputs:
                          'flex gap-2 sm:gap-3 justify-center',

                        // Alert messages
                        alertText:
                          'text-sm p-3 sm:p-4 rounded-lg sm:rounded-xl bg-(--color-surface) border border-(--color-border-primary) shadow-none sm:shadow-sm',

                        // Identity preview (for sign out, etc.)
                        identityPreviewText:
                          'text-(--color-foreground) dark:text-white text-sm sm:text-base',
                        identityPreviewEditButton:
                          'text-(--color-brand-primary) hover:text-(--color-brand-secondary) text-sm min-h-[44px] flex items-center justify-center touch-manipulation',

                        // Footer elements - visible for better UX
                        footer:
                          'text-center mt-4 text-sm text-(--color-text-secondary)',
                        footerAction: 'text-sm text-(--color-text-secondary)',
                        footerActionText:
                          'text-sm text-(--color-text-secondary)',
                        footerActionLink:
                          'text-sm text-(--color-brand-primary) hover:text-(--color-brand-secondary) min-h-[44px] inline-flex items-center justify-center touch-manipulation',

                        // Loading states
                        spinner: 'w-5 h-5 sm:w-6 sm:h-6',

                        // Alternative methods section
                        alternativeMethods: 'space-y-2 sm:space-y-3 mt-4',
                        alternativeMethodsBlockButton:
                          'w-full min-h-[48px] sm:min-h-[52px] py-3 sm:py-4 px-4 sm:px-6 text-base rounded-lg sm:rounded-xl border border-(--color-border-primary) hover:bg-(--color-surface-hover) transition-all touch-manipulation shadow-none sm:shadow-sm hover:shadow-none sm:hover:shadow-md active:scale-[0.98]',
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
});

export default Welcome;
