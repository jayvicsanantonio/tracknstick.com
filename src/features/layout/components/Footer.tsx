import { memo } from 'react';

const Footer = memo(function Footer() {
  return (
    <footer className="text-muted-foreground border-(--color-border-brand) dark:border-(--color-border-primary) mt-auto border-t py-4 transition-colors duration-300 sm:py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-8">
        <div className="flex flex-col items-center justify-between sm:flex-row">
          <p className="mb-2 text-xs sm:mb-0 sm:text-sm">
            © {new Date().getFullYear()} Track N Stick. All rights reserved.
          </p>

          <div className="flex items-center space-x-4">
            <a
              href="#"
              className="text-(--color-brand-primary) hover:text-(--color-brand-secondary) dark:text-(--color-brand-text-light) dark:hover:text-(--color-brand-text-light) text-xs transition hover:opacity-80 sm:text-sm"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-(--color-brand-primary) hover:text-(--color-brand-secondary) dark:text-(--color-brand-text-light) dark:hover:text-(--color-brand-text-light) text-xs transition hover:opacity-80 sm:text-sm"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
