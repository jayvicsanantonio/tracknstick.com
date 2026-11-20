// Site footer shown on every page, below the routed content.
// Holds the copyright line in the same glass pill style as the header.

import { memo } from 'react';
// import MiscellaneousIcons from '@/icons/miscellaneous';

const Footer = memo(function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-8 2xl:max-w-[90rem]">
        <div className="flex items-center justify-center gap-3 rounded-full bg-(--color-surface)/80 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-(--color-border-primary)/40 backdrop-blur-xl backdrop-saturate-150 ring-inset sm:gap-4 sm:px-4 sm:py-3 dark:bg-(--color-surface-secondary)/80">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-(--color-text-secondary) sm:text-sm">
              © {year} Track N&apos; Stick
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
