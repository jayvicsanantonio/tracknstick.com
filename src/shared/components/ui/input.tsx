import { cn } from '@shared/utils/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'shadow-xs flex h-9 w-full min-w-0 rounded-md border-2 px-3 py-1 text-base outline-none',
        'border-(--color-border-primary) bg-(--color-surface) text-(--color-foreground) placeholder:text-(--color-text-secondary)',
        'focus:border-(--color-ring) focus-visible:ring-(--color-ring)/40 focus-visible:ring-2',
        'file:inline-flex file:h-7 file:bg-transparent file:text-sm file:font-medium',
        'file:text-(--color-foreground)',
        'selection:bg-(--color-brand-primary) selection:text-(--color-text-inverse)',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:ring-2 aria-invalid:ring-(--color-destructive)/20',
        'md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
