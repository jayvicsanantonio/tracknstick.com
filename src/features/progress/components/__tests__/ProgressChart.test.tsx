import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render } from '@testing-library/react';
import ProgressChart from '../ProgressChart';

// Recharts measures its container, which jsdom reports as 0x0, so the real
// chart never paints. Capture the props the chart is handed instead.
const captured: { data?: { date: string; completionRate: number }[] } = {};

vi.mock('recharts', () => {
  const Passthrough = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );

  return {
    ResponsiveContainer: Passthrough,
    BarChart: ({
      data,
      children,
    }: {
      data: { date: string; completionRate: number }[];
      children?: React.ReactNode;
    }) => {
      captured.data = data;
      return <div>{children}</div>;
    },
    CartesianGrid: () => null,
    XAxis: ({
      tickFormatter,
    }: {
      tickFormatter?: (value: string) => string;
    }) => (
      <div data-testid="ticks">
        {captured.data?.map((d) => tickFormatter?.(d.date)).join(',')}
      </div>
    ),
    YAxis: () => null,
    Tooltip: () => null,
    Bar: () => null,
  };
});

// Western zones are where a UTC-parsed date key reports the previous day.
const ORIGINAL_TZ = process.env.TZ;

beforeAll(() => {
  process.env.TZ = 'America/Los_Angeles';
});

afterAll(() => {
  process.env.TZ = ORIGINAL_TZ;
});

const history = [
  { date: '2026-08-03', completionRate: 40 },
  { date: '2026-08-02', completionRate: 100 },
  { date: '2026-08-01', completionRate: 0 },
];

describe('ProgressChart', () => {
  it('plots the month left to right, oldest first', () => {
    // The API answers newest first, which is what the streak fold needs; a
    // chart drawn in that order reads the month backwards.
    render(<ProgressChart data={history} />);

    expect(captured.data?.map((d) => d.date)).toEqual([
      '2026-08-01',
      '2026-08-02',
      '2026-08-03',
    ]);
  });

  it('labels each bar with the day the key names', () => {
    const { getByTestId } = render(<ProgressChart data={history} />);

    expect(getByTestId('ticks').textContent).toBe('1,2,3');
  });

  it('leaves the caller its own array', () => {
    const data = [...history];
    render(<ProgressChart data={data} />);

    expect(data).toEqual(history);
  });
});
