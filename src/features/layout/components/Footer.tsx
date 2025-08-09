import { memo } from 'react';
// import MiscellaneousIcons from '@/icons/miscellaneous';

const Footer = memo(function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-8">
        <div
          role="contentinfo"
          aria-label="Site footer"
          className="bg-(--color-surface)/30 dark:bg-(--color-surface-secondary)/40 ring-(--color-border-primary)/40 flex items-center justify-between gap-3 rounded-full px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-inset backdrop-blur-xl backdrop-saturate-150 sm:gap-4 sm:px-4 sm:py-3"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-(--color-text-secondary) text-xs sm:text-sm">
              © {year} Track N&apos; Stick
            </span>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex items-center gap-3 sm:gap-4"
          >
            <a
              href="#"
              className="text-(--color-brand-primary) hover:text-(--color-brand-secondary) dark:text-(--color-brand-text-light) text-xs transition-colors hover:opacity-90 sm:text-sm"
            >
              Privacy
            </a>
            <span
              aria-hidden="true"
              className="text-(--color-border-primary)/70"
            >
              •
            </span>
            <a
              href="#"
              className="text-(--color-brand-primary) hover:text-(--color-brand-secondary) dark:text-(--color-brand-text-light) text-xs transition-colors hover:opacity-90 sm:text-sm"
            >
              Terms
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
