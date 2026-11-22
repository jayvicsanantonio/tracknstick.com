// Covers pull to refresh: pulling the page down from its top far enough asks for fresh data, as iOS lists do.
// A short pull, or one that starts lower down the page or inside a sheet, does nothing.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import PullToRefresh from '../PullToRefresh';

vi.mock('@shared/utils/haptics', () => ({ hapticTick: vi.fn() }));

/** A finger pulling from `from` to `to` pixels down the screen, on `target`. */
function pull(target: Element, from: number, to: number) {
  fireEvent.touchStart(target, { touches: [{ clientX: 100, clientY: from }] });
  fireEvent.touchMove(target, { touches: [{ clientX: 100, clientY: to }] });
  fireEvent.touchEnd(target, { touches: [] });
}

describe('PullToRefresh', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refreshes on a long pull down from the top of the page', async () => {
    const onRefresh = vi.fn(() => Promise.resolve());
    render(<PullToRefresh onRefresh={onRefresh} />);

    await act(async () => {
      pull(document.body, 100, 400);
      await Promise.resolve();
    });

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows that it is refreshing until the fresh data arrives', async () => {
    let finish: () => void = () => undefined;
    const onRefresh = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(<PullToRefresh onRefresh={onRefresh} />);

    act(() => {
      pull(document.body, 100, 400);
    });
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing');

    await act(async () => {
      finish();
      await Promise.resolve();
    });
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('does nothing on a short pull', () => {
    const onRefresh = vi.fn(() => Promise.resolve());
    render(<PullToRefresh onRefresh={onRefresh} />);

    pull(document.body, 100, 140);

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('does nothing on a pull that starts below the top of the page', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(300);
    const onRefresh = vi.fn(() => Promise.resolve());
    render(<PullToRefresh onRefresh={onRefresh} />);

    pull(document.body, 100, 400);

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('leaves a pull inside a sheet or dialog to it', () => {
    const onRefresh = vi.fn(() => Promise.resolve());
    render(
      <>
        <PullToRefresh onRefresh={onRefresh} />
        <div role="dialog">
          <p>Sheet</p>
        </div>
      </>,
    );

    pull(screen.getByText('Sheet'), 100, 400);

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('does nothing on an upward swipe', () => {
    const onRefresh = vi.fn(() => Promise.resolve());
    render(<PullToRefresh onRefresh={onRefresh} />);

    pull(document.body, 400, 100);

    expect(onRefresh).not.toHaveBeenCalled();
  });
});
