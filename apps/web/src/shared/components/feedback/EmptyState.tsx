// The card every page shows when it has nothing to list: an icon, what is missing, and what to do next.
// One component, so the Tracker, Habits and Progress empty states share one size, voice and layout.

import { memo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils/utils';

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  detail: ReactNode;
  /** The heading's level in the page's outline. Defaults to 2. */
  headingLevel?: 2 | 3;
  /** Buttons or links offering the next step. */
  children?: ReactNode;
  /** Shown below the actions, for a quieter secondary option. */
  footer?: ReactNode;
  className?: string;
}

const EmptyState = memo(function EmptyState({
  Icon,
  title,
  detail,
  headingLevel = 2,
  children,
  footer,
  className,
}: EmptyStateProps) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'ios-tracker-card mx-auto flex w-full max-w-md flex-col items-center rounded-[26px] px-6 py-10 text-center sm:px-8 sm:py-12',
        className,
      )}
    >
      <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-(--color-brand-primary)/14 ring-1 ring-(--color-brand-primary)/24 ring-inset">
        <Icon
          aria-hidden="true"
          className="size-7 text-(--color-brand-primary)"
        />
      </span>
      <Heading className="text-xl font-semibold tracking-tight text-(--color-foreground)">
        {title}
      </Heading>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-(--color-text-secondary) sm:text-[15px]">
        {detail}
      </p>
      {children ? (
        <div
          data-empty-state-actions
          className="mt-6 flex w-full flex-col items-center gap-3"
        >
          {children}
        </div>
      ) : null}
      {footer ? <div className="mt-5 w-full">{footer}</div> : null}
    </motion.div>
  );
});

export default EmptyState;
