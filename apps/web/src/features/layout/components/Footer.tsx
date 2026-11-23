// Quiet site footer shown on tablet & desktop below the routed content,
// matching the understated copyright caption in the phone settings sheet.

import { memo } from 'react';

const Footer = memo(function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto hidden py-5 sm:block">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 md:px-8 2xl:max-w-[90rem]">
        <span className="text-xs leading-5 font-medium text-(--color-text-secondary)/75">
          Track N&apos; Stick · © {year}
        </span>
      </div>
    </footer>
  );
});

export default Footer;
