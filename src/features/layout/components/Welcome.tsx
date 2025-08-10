import { memo, useMemo } from 'react';
import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { useTheme } from '@shared/hooks/useTheme';
import { useRive } from '@rive-app/react-canvas';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@shared/components/ui/dialog';
import { ChevronRight } from 'lucide-react';

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
      <div className="relative flex h-[calc(100dvh-12rem)] min-h-[calc(100dvh-12rem)] w-full flex-1 flex-col items-center justify-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="bg-(--color-brand-light) absolute left-20 top-0 h-80 w-80 -translate-y-20 rounded-full opacity-20 blur-3xl" />
          <div className="bg-(--color-accent) absolute right-0 top-40 h-96 w-96 rounded-full opacity-20 blur-3xl" />
        </div>
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-50">
          <RiveComponent className="h-[380px] w-[380px] sm:h-[460px] sm:w-[460px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="mx-auto h-full w-full max-w-7xl px-2 sm:px-4 md:px-8"
        >
          <Card
            variant="glass"
            className="h-full w-full items-center justify-center gap-6 rounded-3xl p-6 text-center sm:gap-7 sm:p-8 md:gap-8 md:p-12"
          >
            <h1 className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="text-(--color-foreground) dark:text-(--color-text-primary) mx-auto max-w-2xl text-balance text-base leading-relaxed sm:text-lg md:text-xl">
              {subtitle}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="brandTonalActive"
                  size="lg"
                  className="rounded-full px-6 py-6 text-base font-semibold sm:text-lg"
                  aria-label="Get started"
                >
                  Get started
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl p-0 sm:max-w-md">
                <DialogTitle className="sr-only">Sign in</DialogTitle>
                <div className="p-6">
                  <SignIn
                    appearance={{
                      elements: {
                        formButtonPrimary:
                          'bg-(--color-brand-primary) hover:bg-(--color-brand-secondary) dark:bg-(--color-brand-secondary) dark:hover:bg-(--color-brand-primary) text-(--color-text-inverse) rounded-full font-semibold shadow-lg',
                        card: 'bg-(--color-card) border border-(--color-border-primary) shadow-xl rounded-2xl',
                      },
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
            <p className="text-(--color-text-secondary) text-xs sm:text-sm">
              Free to try. Your data stays private.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
});

export default Welcome;
