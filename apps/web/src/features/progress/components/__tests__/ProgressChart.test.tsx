// Covers the completion-rate chart's scale: the Y axis always runs from 0 to 100%.
// A data-driven axis made a 33% day look like a full bar.

import { describe, it, expect, vi } from 'vitest';
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
});
