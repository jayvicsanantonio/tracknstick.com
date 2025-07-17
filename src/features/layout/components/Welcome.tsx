import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

export default function Welcome() {
  return (
    <div className="flex-1">
      <div className="relative flex min-h-[78vh] flex-col items-center justify-center overflow-hidden px-2 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="mb-4 text-2xl font-bold text-(--color-brand-tertiary) sm:mb-6 sm:text-3xl md:text-4xl dark:text-(--color-brand-text-light)">
            Welcome to Track N&apos; Stick
          </h2>
          <p className="mb-8 text-base leading-relaxed text-(--color-brand-primary) sm:mb-12 sm:text-lg md:text-xl dark:text-(--color-brand-text-light)">
            Embark on your journey to better habits and personal growth. Start
            by adding your first habit and watch your progress unfold.
          </p>
          <div className="z-10 flex flex-col items-center space-y-4">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary:
                    'bg-(--color-brand-primary) hover:bg-(--color-brand-secondary) dark:bg-(--color-brand-secondary) dark:hover:bg-(--color-brand-primary) text-(--color-text-inverse) rounded-full font-semibold transition-colors duration-300 shadow-lg',
                },
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
