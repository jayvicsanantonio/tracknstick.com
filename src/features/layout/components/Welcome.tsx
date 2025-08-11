import { memo, useMemo } from 'react';
import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { useTheme } from '@shared/hooks/useTheme';
import { useRive } from '@rive-app/react-canvas';
import { Card } from '@shared/components/ui/card';

const Welcome = memo(function Welcome() {
  const isDark = useTheme();

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
      <div className="relative flex h-[calc(100dvh-8rem)] min-h-[calc(100dvh-8rem)] w-full flex-1 overflow-hidden lg:h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-8rem)]">
        {/* Background Elements */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="bg-(--color-brand-light) absolute left-20 top-0 h-80 w-80 -translate-y-20 rounded-full opacity-20 blur-3xl" />
          <div className="bg-(--color-accent) absolute right-0 top-40 h-96 w-96 rounded-full opacity-20 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto flex h-full w-full max-w-7xl items-center justify-center px-4 py-8 lg:px-8 lg:py-16"
        >
          <Card
            variant="glass"
            className="relative h-full w-full overflow-hidden rounded-3xl"
          >
            {/* Rive Animation Background */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-20 lg:opacity-30">
              <RiveComponent className="h-[300px] w-[300px] sm:h-[380px] sm:w-[380px] lg:h-[460px] lg:w-[460px]" />
            </div>

            <div className="flex h-full flex-col lg:flex-row">
              {/* Left Side - Hero Content */}
              <div className="relative flex flex-1 flex-col items-center justify-center p-6 text-center sm:p-8 lg:items-start lg:p-12 lg:text-left">
                <div className="z-10">
                  <h1 className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                    {title}
                  </h1>
                  <p className="text-(--color-foreground) dark:text-(--color-text-primary) mb-8 max-w-2xl text-balance text-lg leading-relaxed sm:text-xl lg:text-2xl">
                    {subtitle}
                  </p>
                  <div className="space-y-4">
                    <p className="text-(--color-text-secondary) text-xs sm:text-sm">
                      Free to try. Your data stays private.
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="bg-(--color-border-primary) mx-6 my-8 h-px w-auto lg:mx-0 lg:my-12 lg:h-auto lg:w-px" />

              {/* Right Side - Sign In Form */}
              <div className="flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-12">
                <div className="w-full max-w-sm">
                  <div className="mb-6 text-center">
                    <h2 className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) text-xl font-semibold">
                      Start Your Journey
                    </h2>
                    <p className="text-(--color-text-secondary) mt-2 text-sm">
                      Transform intention into momentum
                    </p>
                  </div>
                  <SignIn
                    appearance={{
                      elements: {
                        formButtonPrimary:
                          'bg-(--color-brand-primary) hover:bg-(--color-brand-secondary) dark:bg-(--color-brand-secondary) dark:hover:bg-(--color-brand-primary) text-(--color-text-inverse) rounded-full font-semibold shadow-lg transition-all duration-200',
                        card: 'bg-transparent border-0 shadow-none p-0',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                        socialButtonsBlockButton:
                          'bg-(--color-card) border border-(--color-border-primary) dark:border-white hover:bg-(--color-surface-hover) rounded-lg transition-all duration-200 text-(--color-foreground) dark:text-white !text-(--color-foreground) dark:!text-white !border-1 dark:!border-white !border-solid',
                        socialButtonsBlockButtonText:
                          'text-(--color-foreground) dark:text-white font-medium !text-(--color-foreground) dark:!text-white',
                        socialButtonsIconButton:
                          'text-(--color-foreground) dark:text-white !text-(--color-foreground) dark:!text-white',
                        formFieldInput:
                          'bg-(--color-card) border border-(--color-border-primary) rounded-lg focus:border-(--color-brand-primary) text-(--color-foreground) dark:text-white placeholder:text-(--color-text-secondary) dark:placeholder:!text-gray-300',
                        formFieldLabel:
                          'text-(--color-foreground) dark:text-white font-medium',
                        identityPreviewText:
                          'text-(--color-foreground) dark:text-white',
                        formFieldInputShowPasswordButton:
                          'text-(--color-text-secondary) dark:text-gray-400 hover:text-(--color-foreground) dark:hover:text-white',
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
