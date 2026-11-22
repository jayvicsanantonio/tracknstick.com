import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useDaySwipe } from '../useDaySwipe';

function SwipeHarness({
  enabled = true,
  onPreviousDay,
  onNextDay,
  onChildClick,
}: {
  enabled?: boolean;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onChildClick?: () => void;
}) {
  const { feedback, swipeHandlers } = useDaySwipe({
    enabled,
    onPreviousDay,
    onNextDay,
  });

  return (
    <div data-testid="surface" {...swipeHandlers}>
      <button type="button" onClick={onChildClick}>
        Habit
      </button>
      {feedback ? (
        <span data-testid="feedback">
          {feedback.direction}:{feedback.ready ? 'ready' : 'dragging'}
        </span>
      ) : null}
    </div>
  );
}

function dispatchPointer(
  target: Window | HTMLElement,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  {
    clientX,
    clientY,
    pointerType = 'touch',
    pointerId = 1,
  }: {
    clientX: number;
    clientY: number;
    pointerType?: string;
    pointerId?: number;
  },
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
  });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  Object.defineProperty(event, 'pointerId', { value: pointerId });
  fireEvent(target, event);
}

describe('useDaySwipe', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 390,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: originalInnerWidth,
    });
    vi.restoreAllMocks();
  });

  it('moves to the previous date on a right swipe and shows edge feedback while dragging', () => {
    const onPreviousDay = vi.fn();
    const onNextDay = vi.fn();
    render(
      <SwipeHarness onPreviousDay={onPreviousDay} onNextDay={onNextDay} />,
    );

    const surface = screen.getByTestId('surface');
    dispatchPointer(surface, 'pointerdown', { clientX: 80, clientY: 200 });
    dispatchPointer(window, 'pointermove', { clientX: 110, clientY: 202 });
    expect(screen.getByTestId('feedback')).toHaveTextContent('prev:dragging');

    dispatchPointer(window, 'pointermove', { clientX: 160, clientY: 204 });
    expect(screen.getByTestId('feedback')).toHaveTextContent('prev:ready');

    dispatchPointer(window, 'pointerup', { clientX: 160, clientY: 204 });

    expect(onPreviousDay).toHaveBeenCalledTimes(1);
    expect(onNextDay).not.toHaveBeenCalled();
    expect(screen.queryByTestId('feedback')).not.toBeInTheDocument();
  });

  it('moves to the next date on a left swipe', () => {
    const onPreviousDay = vi.fn();
    const onNextDay = vi.fn();
    render(
      <SwipeHarness onPreviousDay={onPreviousDay} onNextDay={onNextDay} />,
    );

    const surface = screen.getByTestId('surface');
    dispatchPointer(surface, 'pointerdown', { clientX: 280, clientY: 200 });
    dispatchPointer(window, 'pointermove', { clientX: 180, clientY: 204 });
    dispatchPointer(window, 'pointerup', { clientX: 180, clientY: 204 });

    expect(onNextDay).toHaveBeenCalledTimes(1);
    expect(onPreviousDay).not.toHaveBeenCalled();
  });

  it('suppresses a synthetic child button click after a horizontal swipe', () => {
    const onPreviousDay = vi.fn();
    const onNextDay = vi.fn();
    const onChildClick = vi.fn();
    render(
      <SwipeHarness
        onPreviousDay={onPreviousDay}
        onNextDay={onNextDay}
        onChildClick={onChildClick}
      />,
    );

    const button = screen.getByRole('button', { name: 'Habit' });
    dispatchPointer(button, 'pointerdown', { clientX: 260, clientY: 200 });
    dispatchPointer(window, 'pointermove', { clientX: 150, clientY: 202 });
    dispatchPointer(window, 'pointerup', { clientX: 150, clientY: 202 });
    fireEvent.click(button);

    expect(onNextDay).toHaveBeenCalledTimes(1);
    expect(onChildClick).not.toHaveBeenCalled();

    // A normal tap still reaches the child button.
    dispatchPointer(button, 'pointerdown', { clientX: 200, clientY: 200 });
    dispatchPointer(window, 'pointerup', { clientX: 200, clientY: 200 });
    fireEvent.click(button);
    expect(onChildClick).toHaveBeenCalledTimes(1);
  });

  it('ignores vertical scrolling and short swipes below the commit threshold', () => {
    const onPreviousDay = vi.fn();
    const onNextDay = vi.fn();
    render(
      <SwipeHarness onPreviousDay={onPreviousDay} onNextDay={onNextDay} />,
    );

    const surface = screen.getByTestId('surface');
    // Vertical scroll
    dispatchPointer(surface, 'pointerdown', { clientX: 200, clientY: 150 });
    dispatchPointer(window, 'pointermove', { clientX: 205, clientY: 280 });
    dispatchPointer(window, 'pointerup', { clientX: 205, clientY: 280 });

    // Short horizontal drag held long enough to stay below flick velocity
    const nowSpy = vi.spyOn(Date, 'now');
    nowSpy.mockReturnValue(1000);
    dispatchPointer(surface, 'pointerdown', { clientX: 200, clientY: 200 });
    nowSpy.mockReturnValue(1500);
    dispatchPointer(window, 'pointermove', { clientX: 220, clientY: 200 });
    dispatchPointer(window, 'pointerup', { clientX: 220, clientY: 200 });

    expect(onPreviousDay).not.toHaveBeenCalled();
    expect(onNextDay).not.toHaveBeenCalled();
  });

  it('leaves the 16px iOS screen-edge zone free for browser navigation', () => {
    const onPreviousDay = vi.fn();
    const onNextDay = vi.fn();
    render(
      <SwipeHarness onPreviousDay={onPreviousDay} onNextDay={onNextDay} />,
    );

    const surface = screen.getByTestId('surface');
    dispatchPointer(surface, 'pointerdown', { clientX: 8, clientY: 200 });
    dispatchPointer(window, 'pointermove', { clientX: 160, clientY: 200 });
    dispatchPointer(window, 'pointerup', { clientX: 160, clientY: 200 });

    expect(onPreviousDay).not.toHaveBeenCalled();
    expect(onNextDay).not.toHaveBeenCalled();
  });
});
