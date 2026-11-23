// The loading state shown while a page's code downloads: the launch splash's medallion, small.
// In the theme's brand colour, with an arc travelling round the ring; still for reduced motion.

import { memo } from 'react';

// The ring, from its top and clockwise, as the launch splash draws it.
const RING = 'M100 17a83 83 0 1 1 0 166a83 83 0 1 1 0-166';

const LoadingFallback = memo(function LoadingFallback() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div role="status" aria-label="Loading" className="flex">
        <svg
          viewBox="0 0 200 200"
          aria-hidden="true"
          focusable="false"
          className="size-14 sm:size-16"
        >
          <circle
            cx="100"
            cy="100"
            r="67"
            className="fill-(--color-brand-primary)/12"
          />
          <circle
            cx="100"
            cy="100"
            r="83"
            fill="none"
            strokeWidth="14.5"
            className="stroke-(--color-brand-primary)/15"
          />
          <path
            d={RING}
            pathLength="100"
            strokeDasharray="28 72"
            fill="none"
            strokeWidth="14.5"
            strokeLinecap="round"
            className="origin-center animate-spin stroke-(--color-brand-primary) [transform-box:view-box] motion-reduce:animate-none"
          />
          <g transform="translate(50 50) scale(1.5625)">
            <path
              d="M10 34L25 49L54 17"
              fill="none"
              strokeWidth="8.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-(--color-brand-primary)"
            />
          </g>
        </svg>
      </div>
    </div>
  );
});

export default LoadingFallback;
