// A row of tabs drawn as an iOS segmented control: a grey track with a raised thumb that slides to the choice.
// Built on the Radix tab list, so it goes inside a <Tabs> and keeps its roles and arrow-key behaviour.

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@shared/utils/utils';

interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedTabsListProps
  extends Omit<React.ComponentProps<typeof TabsPrimitive.List>, 'children'> {
  /** The selected choice, the same value the surrounding <Tabs> holds. */
  value: string;
  options: SegmentedOption[];
}

function SegmentedTabsList({
  value,
  options,
  className,
  ...props
}: SegmentedTabsListProps) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  return (
    <TabsPrimitive.List
      data-slot="segmented-control"
      className={cn(
        'relative grid h-10 w-full shrink-0 items-stretch rounded-[10px] bg-(--color-muted) p-0.5',
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
      {...props}
    >
      {/* The thumb sits under the selected tab and slides to the next one,
          as iOS moves it, rather than jumping. */}
      <span
        aria-hidden="true"
        data-segment-thumb
        className="pointer-events-none absolute inset-y-0.5 left-0.5 rounded-lg bg-(--color-surface) shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none dark:bg-white/20"
        style={{
          // One column of the track inside its 2px padding.
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((option) => (
        <TabsPrimitive.Trigger
          key={option.value}
          value={option.value}
          className="relative z-10 flex cursor-pointer items-center justify-center rounded-lg px-2 text-sm font-medium whitespace-nowrap text-(--color-foreground) outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) data-[state=active]:font-semibold"
        >
          {option.label}
        </TabsPrimitive.Trigger>
      ))}
    </TabsPrimitive.List>
  );
}

export { SegmentedTabsList };
