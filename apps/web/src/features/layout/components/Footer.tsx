// Quiet site footer shown on tablet & desktop below the routed content,
// matching the understated copyright caption in the phone settings sheet.

import { memo } from 'react';
import { PAGE_CONTAINER } from '@shared/constants/layout';
import { cn } from '@shared/utils/utils';

const Footer = memo(function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto hidden py-5 sm:block">
      <div className={cn(PAGE_CONTAINER, 'flex items-center justify-center')}>
        <span className="text-xs leading-5 font-medium text-(--color-text-secondary)/75">
          Track N&apos; Stick · © {year}
        </span>
      </div>
    </footer>
  );
});

export default Footer;
