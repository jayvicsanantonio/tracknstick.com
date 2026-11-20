// Covers the completion-rate chart: a 0-100% Y axis, and bars labelled with their own calendar day.
// A data-driven axis made a 33% day look like a full bar; each YYYY-MM-DD key is its local day in any timezone.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cloneElement, type ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import ProgressChart from '../ProgressChart';

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
    expect(screen.getAllByText('100').length).toBeGreaterThan(0);
    expect(screen.getAllByText('50').length).toBeGreaterThan(0);
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
