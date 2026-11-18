// Covers the day labels on the completion rate chart.
// Each bar's date is a YYYY-MM-DD key, labelled with that calendar day in any timezone.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressChart from '../ProgressChart';

describe('ProgressChart', () => {
  beforeEach(() => {
    vi.stubEnv('TZ', 'America/Los_Angeles');
    // ResponsiveContainer constructs a ResizeObserver with `new`, which the
    // arrow-function stub in the shared setup does not support.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );
    // jsdom does no layout, so ResponsiveContainer would measure 0 x 0 and
    // draw nothing.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 0, 600, 400),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("labels a bar with its key's day of the month", () => {
    // One bar: the stubbed measurement also makes every tick label look
    // 600px wide, so recharts would hide all but one as overlapping.
    render(
      <ProgressChart data={[{ date: '2026-11-17', completionRate: 100 }]} />,
    );

    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.queryByText('16')).not.toBeInTheDocument();
  });
});
