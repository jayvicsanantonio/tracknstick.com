import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@shared/utils/utils';

const cardVariants = cva(
  'relative flex flex-col gap-6 rounded-xl border text-(--color-card-foreground) transition-colors',
  {
    variants: {
      variant: {
        default: 'border-(--color-border-primary) bg-(--color-card) shadow-sm',
        elevated:
          'border-(--color-border-primary) bg-(--color-card) shadow-xl shadow-(--color-border-brand)/30',
        subtle: 'border-transparent bg-(--color-surface-secondary) shadow-sm',
        glass:
          'border-(--color-border-primary)/60 bg-(--color-card)/60 backdrop-blur-md shadow-sm',
        outline: 'border-(--color-border-brand) bg-(--color-surface) shadow-sm',
      },
      padding: {
        none: 'p-0',
        sm: 'py-4',
        md: 'py-6',
        lg: 'py-8',
      },
      interactive: {
        false: '',
        true: 'transition-shadow hover:shadow-lg hover:shadow-(--color-border-brand)/40',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      interactive: false,
    },
  },
);

type CardProps = React.ComponentProps<'div'> &
  VariantProps<typeof cardVariants> & {
    accent?: boolean;
  };

function Card({
  className,
  variant,
  padding,
  interactive,
  accent,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, padding, interactive }), className)}
      {...props}
    >
      {accent ? (
        <div
          aria-hidden
          className="from-(--color-brand-light) via-(--color-border-brand) to-(--color-brand-light) pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r"
        />
      ) : null}
      {props.children}
    </div>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6',
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-(--color-text-secondary) text-sm', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('[.border-t]:pt-6 flex items-center px-6', className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
