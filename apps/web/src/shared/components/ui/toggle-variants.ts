import { cva } from 'class-variance-authority';

export const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-(--color-hover-surface) hover:text-(--color-foreground) disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-(--color-surface-secondary) data-[state=on]:text-(--color-foreground) [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:ring-(--color-ring) focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-900/20 aria-invalid:border-red-500 whitespace-nowrap",
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-(--color-border) bg-transparent shadow-xs hover:bg-(--color-hover-surface) hover:text-(--color-foreground)',
      },
      size: {
        default: 'h-9 px-2 min-w-9',
        sm: 'h-8 px-1.5 min-w-8',
        lg: 'h-10 px-2.5 min-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
