import { SignIn } from '@clerk/clerk-react';
import { useRive } from '@rive-app/react-canvas';
import { Card } from '@shared/components/ui/card';
import { useTheme } from '@shared/hooks/useTheme';
import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

const Welcome = memo(function Welcome() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const { RiveComponent } = useRive({
    src: '/rive/wicked-orbs.riv',
    autoplay: true,
    stateMachines: 'Pulse',
  });

  const title = useMemo(
    () => (isDark ? 'Defy Gravity' : 'Sparkle Up'),
    [isDark],
  );
  const subtitle = useMemo(
    () =>
      isDark
        ? 'Build habits that stick — calm, focused, and quietly powerful.'
        : 'Build habits that shine — simple, friendly, and delightfully light.',
    [isDark],
  );

  return (
    <div className="flex-1">
      <div className="relative flex w-full flex-1 overflow-hidden">
        {/* Background Elements */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="bg-(--color-brand-light) absolute left-20 top-0 h-80 w-80 -translate-y-20 rounded-full opacity-20 blur-3xl" />
          <div className="bg-(--color-accent) absolute right-0 top-40 h-96 w-96 rounded-full opacity-20 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-7xl flex-col items-center justify-center px-3 py-4 sm:px-4 sm:py-6 md:flex-row md:px-6 md:py-8 lg:px-8 lg:py-16"
        >
          <Card
            variant="glass"
            className="relative w-full max-w-7xl overflow-hidden rounded-2xl sm:rounded-3xl md:max-h-[calc(100vh-8rem)]"
          >
            {/* Rive Animation Background */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-10 sm:opacity-15 md:opacity-20 lg:opacity-30">
              <RiveComponent className="h-[250px] w-[250px] sm:h-[300px] sm:w-[300px] md:h-[350px] md:w-[350px] lg:h-[460px] lg:w-[460px]" />
            </div>

            <div className="flex min-h-full w-full flex-col items-center md:flex-row lg:flex-row">
              {/* Left Side - Hero Content */}
              <div className="relative flex flex-1 flex-col items-center justify-center p-4 text-center sm:p-6 md:items-start md:p-8 md:text-left lg:p-12">
                <div className="z-10 w-full max-w-lg md:max-w-none">
                  <h1 className="text-(--color-brand-primary) dark:text-(--color-brand-text-light) mb-3 text-2xl font-extrabold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl lg:text-6xl">
                    {title}
                  </h1>
                  <p className="text-(--color-brand-tertiary) dark:text-(--color-text-primary) mb-4 text-balance text-sm leading-relaxed sm:mb-6 sm:text-base md:text-lg lg:max-w-2xl lg:text-2xl">
                    {subtitle}
                  </p>
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-(--color-text-secondary) text-xs sm:text-sm">
                      Free to try. Your data stays private.
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="bg-(--color-border-primary) mx-8 my-3 h-px w-auto sm:mx-12 sm:my-4 md:mx-0 md:my-6 md:h-auto md:w-px lg:my-12" />

              {/* Right Side - Sign In Form */}
              <div className="flex flex-1 justify-center pb-12 pt-4 sm:p-6 sm:pb-16 md:p-8 md:pb-8 lg:p-12">
                <div>
                  <div className="mb-3 text-center sm:mb-4">
                    <h2 className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) text-base font-semibold sm:text-lg">
                      Start Your Journey
                    </h2>
                    <p className="text-(--color-text-secondary) mt-1 text-xs sm:text-sm">
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
