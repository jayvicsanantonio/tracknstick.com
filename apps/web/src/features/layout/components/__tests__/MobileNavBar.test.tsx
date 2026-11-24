// Covers the phone navigation bar: the profile button that opens Settings, and the
// leading action, which stays a single reachable button before and after the bar collapses.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import MobileNavBar from '@/features/layout/components/MobileNavBar';
import { MobileShellContext } from '@/features/layout/context/MobileShellContextDefinition';

function renderNavBar(
  props: Partial<React.ComponentProps<typeof MobileNavBar>> = {},
  openSettings = vi.fn(),
) {
  render(
    <MobileShellContext.Provider
      value={{ openSettings, userImageUrl: undefined, userInitial: 'D' }}
    >
      <MobileNavBar title="Today" {...props} />
    </MobileShellContext.Provider>,
  );
  return { openSettings };
}

function scrollWindowTo(y: number) {
  Object.defineProperty(window, 'scrollY', {
    value: y,
    configurable: true,
    writable: true,
  });
  fireEvent.scroll(window);
}

describe('MobileNavBar', () => {
  afterEach(() => {
    scrollWindowTo(0);
  });

  it('opens Settings from the profile button', () => {
    const { openSettings } = renderNavBar();

    fireEvent.click(
      screen.getByRole('button', { name: 'Open profile and settings' }),
    );

    expect(openSettings).toHaveBeenCalledOnce();
  });

  it('shows the leading action once while the Large Title shows', () => {
    renderNavBar({ leading: <button type="button">Today</button> });

    expect(screen.getAllByRole('button', { name: 'Today' })).toHaveLength(1);
  });

  it('shows the leading action once after the bar collapses on scroll', () => {
    renderNavBar({ leading: <button type="button">Today</button> });

    scrollWindowTo(120);

    expect(screen.getAllByRole('button', { name: 'Today' })).toHaveLength(1);
  });

  it('shows the leading action once in the compact bar', () => {
    renderNavBar({
      compact: true,
      leading: <button type="button">Today</button>,
    });

    expect(screen.getAllByRole('button', { name: 'Today' })).toHaveLength(1);
  });
});
