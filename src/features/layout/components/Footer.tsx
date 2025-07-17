const Footer = () => (
  <footer className="text-muted-foreground mt-auto border-t border-[var(--color-border-brand)] py-4 transition-colors duration-300 sm:py-6 md:py-10 dark:border-[var(--color-border-primary)]">
    <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-8">
      <div className="flex flex-col items-center justify-between sm:flex-row">
        <p className="mb-2 text-xs sm:mb-0 sm:text-sm">
          © {new Date().getFullYear()} Track N Stick. All rights reserved.
        </p>

        <div className="flex items-center space-x-4">
          <a
            href="#"
            className="text-xs text-[var(--color-brand-primary)] transition hover:text-[var(--color-brand-secondary)] hover:opacity-80 sm:text-sm dark:text-[var(--color-brand-text-light)] dark:hover:text-[var(--color-brand-text-light)]"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-xs text-[var(--color-brand-primary)] transition hover:text-[var(--color-brand-secondary)] hover:opacity-80 sm:text-sm dark:text-[var(--color-brand-text-light)] dark:hover:text-[var(--color-brand-text-light)]"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
