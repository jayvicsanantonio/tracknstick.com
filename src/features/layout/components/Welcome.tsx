import { memo, useMemo } from 'react';
import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { useTheme } from '@shared/hooks/useTheme';
import { useRive } from '@rive-app/react-canvas';

const Welcome = memo(function Welcome() {
  const isDark = useTheme();

  const { RiveComponent } = useRive({
    src: '/rive/wicked-orbs.riv',
    autoplay: true,
    stateMachines: 'Pulse',
  });

  const title = useMemo(
    () => (isDark ? 'Defy Gravity' : 'Good to be Glinda'),
    [isDark],
  );

  return (
    <div className="flex-1">
      <div className="relative flex min-h-[78vh] flex-col items-center justify-center overflow-hidden px-2 sm:px-4">
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
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) mb-4 text-2xl font-extrabold tracking-tight sm:mb-6 sm:text-3xl md:text-5xl">
            {title}
          </h2>
          <p className="text-(--color-brand-primary) dark:text-(--color-brand-text-light) mb-8 text-base leading-relaxed sm:mb-12 sm:text-lg md:text-xl">
            A story of better habits—with a touch of magic. Begin your journey,
            and let every small win lift you higher.
          </p>
          <div className="z-10 flex flex-col items-center space-y-4">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary:
                    'bg-(--color-brand-primary) hover:bg-(--color-brand-secondary) dark:bg-(--color-brand-secondary) dark:hover:bg-(--color-brand-primary) text-(--color-text-inverse) rounded-full font-semibold shadow-lg',
                },
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
});

export default Welcome;
