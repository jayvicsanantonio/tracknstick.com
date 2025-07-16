import { SignIn } from "@clerk/clerk-react";
import { motion } from "framer-motion";

export default function Welcome() {
  return (
    <div className="flex-1">
      <div className="flex flex-col items-center justify-center min-h-[78vh] relative overflow-hidden px-2 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-brand-tertiary)] dark:text-[var(--color-brand-text-light)] mb-4 sm:mb-6">
            Welcome to Track N&apos; Stick
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[var(--color-brand-primary)] dark:text-[var(--color-brand-text-light)] mb-8 sm:mb-12 leading-relaxed">
            Embark on your journey to better habits and personal growth. Start
            by adding your first habit and watch your progress unfold.
          </p>
          <div className="flex flex-col items-center space-y-4 z-10">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)] dark:bg-[var(--color-brand-secondary)] dark:hover:bg-[var(--color-brand-primary)] text-[var(--color-text-inverse)] rounded-full font-semibold transition-colors duration-300 shadow-lg",
                },
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
