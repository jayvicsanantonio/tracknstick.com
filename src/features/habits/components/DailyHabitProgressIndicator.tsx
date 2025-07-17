import { motion } from "framer-motion";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { Check } = MiscellaneousIcons;

export default function DailyHabitProgressIndicator({
  completionRate,
}: {
  completionRate: number;
}) {
  const displayRate = Number.isNaN(completionRate) ? 0 : completionRate;

  return (
    <div
      className="mt-4 mb-12 flex flex-col items-center justify-center"
      aria-label={`Daily habit completion: ${displayRate}%`}
    >
      <div className="relative h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64">
        {/* Drop shadow for the progress circle */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[var(--color-brand-primary)]/30 dark:bg-[var(--color-brand-primary)]/20"
        ></div>

        <div className="relative h-full w-full">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            {/* Background track */}
            <circle
              aria-hidden="true"
              className="text-[var(--color-brand-tertiary)]/20 dark:text-[var(--color-brand-tertiary)]/80"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="42"
              cx="50"
              cy="50"
            />

            {/* Glowing effect behind progress */}
            <motion.circle
              aria-hidden="true"
              className="text-[var(--color-brand-primary)]/30 dark:text-[var(--color-brand-primary)]/30"
              strokeWidth="14"
              strokeDasharray={42 * 2 * Math.PI}
              strokeDashoffset={42 * 2 * Math.PI * (1 - displayRate / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="42"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: 42 * 2 * Math.PI }}
              animate={{
                strokeDashoffset: 42 * 2 * Math.PI * (1 - displayRate / 100),
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Main progress indicator */}
            <motion.circle
              aria-hidden="true"
              className="text-[var(--color-brand-primary)] dark:text-[var(--color-brand-primary)]"
              strokeWidth="10"
              strokeDasharray={42 * 2 * Math.PI}
              strokeDashoffset={42 * 2 * Math.PI * (1 - displayRate / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="42"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: 42 * 2 * Math.PI }}
              animate={{
                strokeDashoffset: 42 * 2 * Math.PI * (1 - displayRate / 100),
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>

          {/* Central display */}
          <div className="absolute inset-0 flex items-center justify-center">
            {displayRate === 100 ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className={`rounded-full p-5`} aria-hidden="true">
                  <Check className="h-32 w-32 text-[var(--color-brand-primary)]" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-5xl font-bold text-[var(--color-brand-tertiary)] dark:text-[var(--color-brand-text-light)]">
                  {displayRate}%
                </span>
                <span className="mt-1 text-sm text-[var(--color-brand-primary)] dark:text-[var(--color-brand-text-light)]">
                  Completed
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
