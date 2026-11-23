// Shared tablet & desktop page container width so Header, Footer, and every
// routed page align to the exact same left and right edges across breakpoints.

export const APP_MAX_WIDTH = 'max-w-6xl';
export const PAGE_CONTAINER = 'mx-auto w-full max-w-6xl px-4 md:px-8';

// The pill button a page shows on the right of its tablet & desktop PageHeader
// (Tracker's "Back to Today", Coach's "New chat").
export const PAGE_HEADER_ACTION =
  'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-(--color-brand-primary)/12 px-3.5 text-xs font-semibold text-(--color-brand-text) ring-1 ring-(--color-brand-primary)/20 transition-[background-color,transform] ring-inset hover:bg-(--color-brand-primary)/20 focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-95 dark:text-(--color-brand-text-light)';
