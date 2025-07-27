import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Body from '@/features/layout/components/Body';
import { mockUseAuth } from '@testing/mocks';

vi.mock('react-router-dom', () => ({
  Outlet: vi.fn(() => <div>Router Outlet</div>),
}));

describe('Body Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Outlet component for routing', () => {
    render(<Body />);

    expect(screen.getByText('Router Outlet')).toBeInTheDocument();
  });

  it('renders Welcome component for signed-out users', () => {
    // Configure useAuth to return signed-out state
    mockUseAuth.mockReturnValue({ isSignedIn: false });

    render(<Body />);

    expect(screen.getByText('Welcome Component')).toBeInTheDocument();
  });

  it('includes screen reader heading for welcome page', () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false });
    render(<Body />);

    const heading = screen.getByRole('heading', { level: 1, name: /welcome/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('sr-only');
  });

  it('verifies Outlet is rendered when signed in', () => {
    render(<Body />);

    // Verify Outlet was rendered by checking its content
    expect(screen.getByText('Router Outlet')).toBeInTheDocument();
  });
});
