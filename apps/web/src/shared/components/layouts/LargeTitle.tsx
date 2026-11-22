// A page's heading, drawn as an iOS large title on phones: big and bold at the top, scrolling away under the top bar.
// From sm up the header's navigation names the page, so the heading is kept for screen readers only.

import type { ReactNode } from 'react';

/**
 * How far the large title reaches down the page, in pixels: past it, the
 * phone's top bar shows the page's name instead.
 */
export const LARGE_TITLE_HEIGHT = 44;

export default function LargeTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="mx-auto w-full max-w-7xl px-4 pb-2 font-display text-[34px] leading-[41px] font-bold tracking-tight text-(--color-foreground) sm:sr-only">
      {children}
    </h1>
  );
}
