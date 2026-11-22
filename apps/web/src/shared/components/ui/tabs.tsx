import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@shared/utils/utils';

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex h-10 w-fit items-center justify-center rounded-xl bg-(--color-muted) p-[3px] text-(--color-text-secondary) ring-1 ring-(--color-border-primary)/40 ring-inset sm:h-9 sm:rounded-lg',
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border border-transparent px-2.5 py-1 text-sm font-medium whitespace-nowrap text-(--color-foreground) transition-[background-color,color,box-shadow,transform] duration-200 focus-visible:ring-[3px] focus-visible:ring-(--color-ring)/50 focus-visible:outline-1 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-(--color-surface) data-[state=active]:font-semibold data-[state=active]:shadow-sm sm:rounded-md',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
