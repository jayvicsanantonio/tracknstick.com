const Footer = () => (
  <footer className="mt-auto py-4 sm:py-6 md:py-10 border-t transition-colors duration-300 border-[var(--color-border-brand)] dark:border-[var(--color-border-primary)] text-muted-foreground">
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <p className="text-xs sm:text-sm mb-2 sm:mb-0">
          © {new Date().getFullYear()} Track N Stick. All rights reserved.
        </p>

        <div className="flex items-center space-x-4">
          <a
            href="#"
            className="text-xs sm:text-sm transition hover:opacity-80 text-[var(--color-brand-primary)] hover:text-[var(--color-brand-secondary)] dark:text-[var(--color-brand-text-light)] dark:hover:text-[var(--color-brand-text-light)]"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-xs sm:text-sm transition hover:opacity-80 text-[var(--color-brand-primary)] hover:text-[var(--color-brand-secondary)] dark:text-[var(--color-brand-text-light)] dark:hover:text-[var(--color-brand-text-light)]"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
