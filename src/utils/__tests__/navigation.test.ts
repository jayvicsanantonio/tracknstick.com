import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES, useAppNavigation, isValidRoute } from '@/utils/navigation';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}));

describe('Navigation Utilities', () => {
  describe('ROUTES constants', () => {
    it('defines all expected routes', () => {
      expect(ROUTES.DASHBOARD).toBe('/');
      expect(ROUTES.HABITS).toBe('/habits');
      expect(ROUTES.PROGRESS).toBe('/progress');
    });
  });

  describe('useAppNavigation hook', () => {
    it('provides navigation methods', () => {
      const mockNavigate = vi.fn();
      const mockLocation = { pathname: '/habits' };

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useLocation).mockReturnValue(
        mockLocation as ReturnType<typeof useLocation>,
      );

      const { result } = renderHook(() => useAppNavigation());

      // Test navigateTo
      result.current.navigateTo('/progress');
      expect(mockNavigate).toHaveBeenCalledWith('/progress', undefined);

      // Test goToDashboard
      result.current.goToDashboard();
      expect(mockNavigate).toHaveBeenCalledWith('/', undefined);

      // Test goToHabits
      result.current.goToHabits();
      expect(mockNavigate).toHaveBeenCalledWith('/habits', undefined);

      // Test goToProgress
      result.current.goToProgress();
      expect(mockNavigate).toHaveBeenCalledWith('/progress', undefined);

      // Test goBack
      result.current.goBack();
      expect(mockNavigate).toHaveBeenCalledWith(-1);

      // Test getCurrentRoute
      expect(result.current.getCurrentRoute()).toBe('/habits');
    });

    it('provides route checking methods', () => {
      const mockNavigate = vi.fn();
      const mockLocation = { pathname: '/habits' };

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useLocation).mockReturnValue(
        mockLocation as ReturnType<typeof useLocation>,
      );

      const { result } = renderHook(() => useAppNavigation());

      expect(result.current.isOnDashboard()).toBe(false);
      expect(result.current.isOnHabits()).toBe(true);
      expect(result.current.isOnProgress()).toBe(false);
    });
  });

  describe('isValidRoute helper', () => {
    it('correctly validates routes', () => {
      expect(isValidRoute('/')).toBe(true);
      expect(isValidRoute('/habits')).toBe(true);
      expect(isValidRoute('/progress')).toBe(true);

      expect(isValidRoute('/unknown')).toBe(false);
      expect(isValidRoute('/invalid/path')).toBe(false);
    });
  });
});
