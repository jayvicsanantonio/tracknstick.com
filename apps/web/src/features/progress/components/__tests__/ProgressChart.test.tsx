// Covers the completion-rate chart: a 0-100% Y axis, bars labelled with their own day, and no empty axes.
// A data-driven axis made a 33% day look like a full bar; each YYYY-MM-DD key is its local day in any timezone.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cloneElement, type ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { triggerHaptic } from '@shared/utils/haptics';
import ProgressChart from '../ProgressChart';

vi.mock('@shared/utils/haptics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/utils/haptics')>();
  return {
    ...actual,
    triggerHaptic: vi.fn(),
  };
});

// jsdom has no layout, so the responsive wrapper would measure 0x0 and draw
// nothing. Give the chart a fixed size instead.
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactElement }) =>
      cloneElement(
        children as ReactElement<{ width: number; height: number }>,
        {
          width: 800,
          height: 400,
        },
      ),
  };
});

describe('ProgressChart', () => {
  it('scales the Y axis from 0 to 100 percent', () => {
    render(
      <ProgressChart data={[{ date: '2026-11-17', completionRate: 33 }]} />,
    );

    // Recharts nests each tick label, so a label can match more than once.
    expect(screen.getAllByText('100%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
  });

  it("marks the month's average with a labelled line", () => {
    render(
      <ProgressChart
        data={[
          { date: '2026-11-02', completionRate: 50 },
          { date: '2026-11-01', completionRate: 100 },
        ]}
      />,
    );

    expect(screen.getByText('Avg 75%')).toBeInTheDocument();
  });

  it('says there is nothing to chart, and how to fill it, instead of drawing empty axes', () => {
    render(<ProgressChart data={[]} />);

    expect(screen.getByText('No check-ins this month yet')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Check off a habit and each day's completion shows here.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('triggers one selection haptic per bar crossed while touch-scrubbing', () => {
    vi.mocked(triggerHaptic).mockClear();
    render(
      <ProgressChart
        data={[
          { date: '2026-11-01', completionRate: 50 },
          { date: '2026-11-02', completionRate: 100 },
        ]}
      />,
    );

    const chart = screen.getByRole('img');
    vi.spyOn(chart, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 240,
      bottom: 200,
      width: 240,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    // Bar 0 spans plotX [36..136], Bar 1 spans [136..236]
    fireEvent.touchStart(chart, { touches: [{ clientX: 60 }] });
    expect(triggerHaptic).toHaveBeenCalledTimes(1);
    expect(triggerHaptic).toHaveBeenCalledWith('selection');

    // Moving within bar 0 should not re-trigger
    fireEvent.touchMove(chart, { touches: [{ clientX: 80 }] });
    expect(triggerHaptic).toHaveBeenCalledTimes(1);

    // Crossing into bar 1 triggers once
    fireEvent.touchMove(chart, { touches: [{ clientX: 180 }] });
    expect(triggerHaptic).toHaveBeenCalledTimes(2);

    fireEvent.touchEnd(chart);
  });

  describe('west of UTC', () => {
    beforeEach(() => {
      vi.stubEnv('TZ', 'America/Los_Angeles');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("labels a bar with its key's day of the month", () => {
      render(
        <ProgressChart data={[{ date: '2026-11-17', completionRate: 100 }]} />,
      );

      // Recharts nests each tick label, so a label can match more than once.
      expect(screen.getAllByText('17').length).toBeGreaterThan(0);
      expect(screen.queryByText('16')).not.toBeInTheDocument();
    });
  });
});
