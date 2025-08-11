import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-(--color-ring) focus-visible:ring-[3px] aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-900/20 aria-invalid:border-red-500",
  {
    variants: {
      variant: {
        // Brand-aware defaults using design tokens
        default:
          'bg-(--color-primary) text-(--color-primary-foreground) shadow-xs hover:bg-(--color-primary)/90',
        destructive:
          'bg-red-500 text-white shadow-xs hover:bg-red-500/90 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40',
        outline:
          'border border-(--color-border) bg-(--color-card) text-(--color-foreground) shadow-xs hover:bg-(--color-hover-surface) hover:text-(--color-foreground)',
        secondary:
          'bg-(--color-secondary) text-(--color-secondary-foreground) shadow-xs hover:bg-(--color-secondary)/80',
        ghost:
          'hover:bg-(--color-hover-surface) hover:text-(--color-foreground)',
        link: 'text-(--color-primary) underline-offset-4 hover:underline',

        // Header / navigation specific variants
        brandTonal:
          'bg-(--color-brand-primary)/20 text-(--color-brand-primary) shadow-md hover:bg-(--color-brand-light) hover:shadow-lg dark:bg-(--color-surface-secondary)/60 dark:text-(--color-brand-primary) dark:hover:bg-(--color-surface-tertiary)',
        brandTonalActive:
          'bg-(--color-brand-secondary) text-(--color-text-inverse) shadow-lg hover:bg-(--color-brand-tertiary)',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-8 sm:size-10 p-0 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
