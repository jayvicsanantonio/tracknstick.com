// The tablet & desktop page header: a Large Title, a one-line description and an optional action.
// Shared by every signed-in page so titles sit at the same height with the same gap below.

import { memo, type ReactNode } from 'react';

interface PageHeaderProps {
  /** The page's Large Title; a node lets the Tracker animate it as days change. */
  title: ReactNode;
  /** One line under the title saying what the page is for. */
  description: string;
  /** Optional control on the right, styled with PAGE_HEADER_ACTION. */
  action?: ReactNode;
  /**
   * Shows the title as plain text hidden from assistive tech, for a page whose
   * heading already names the same thing (the Tracker's date heading).
   */
  decorativeTitle?: boolean;
}

const TITLE =
  'text-[32px] leading-none font-extrabold tracking-[-0.025em] text-(--color-foreground)';

const PageHeader = memo(function PageHeader({
  title,
  description,
  action,
  decorativeTitle = false,
}: PageHeaderProps) {
  return (
    <div className="mb-6 hidden min-h-14 items-end justify-between gap-4 sm:flex">
      <div className="min-w-0">
        {decorativeTitle ? (
          <p aria-hidden="true" className={TITLE}>
            {title}
          </p>
        ) : (
          <h2 className={TITLE}>{title}</h2>
        )}
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
});

export default PageHeader;
