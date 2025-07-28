import { cn } from '@shared/utils/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'shadow-xs flex h-9 w-full min-w-0 rounded-md border-2 px-3 py-1 text-base outline-none transition-[color,box-shadow]',
        'border-purple-200 bg-white text-zinc-900 placeholder:text-zinc-500',
        'dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-400',
        'focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-300',
        'dark:focus:border-purple-400 dark:focus-visible:ring-purple-400',
        'file:inline-flex file:h-7 file:bg-transparent file:text-sm file:font-medium',
        'file:text-zinc-950 dark:file:text-zinc-50',
        'selection:bg-purple-500 selection:text-white',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:ring-2 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40',
        'md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
