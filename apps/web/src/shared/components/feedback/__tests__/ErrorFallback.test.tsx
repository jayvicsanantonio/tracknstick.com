// Covers the error screen both error boundaries render, and the launch splash over it.
// An error during the first render skips the layout's splash hand-off, so the error screen takes it down.

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ErrorFallback } from '../ErrorFallback';

describe('ErrorFallback', () => {
  afterEach(() => {
    document.getElementById('splash')?.remove();
  });

  it('offers a refresh', () => {
    render(<ErrorFallback />);

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Refresh Page' }),
    ).toBeInTheDocument();
  });

  it('takes down the launch splash, which would otherwise hide it', async () => {
    const splash = document.createElement('div');
    splash.id = 'splash';
    document.body.append(splash);

    render(<ErrorFallback />);

    await waitFor(() => expect(splash).toHaveClass('splash-done'));
  });
});
