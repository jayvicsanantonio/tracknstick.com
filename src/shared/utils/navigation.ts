import {
  useNavigate,
  useLocation,
  type NavigateOptions,
} from 'react-router-dom';

/**
 * Application route definitions
 * Centralized route constants for type safety and consistency
 */
export const ROUTES = {
  DASHBOARD: '/',
  HABITS: '/habits',
  PROGRESS: '/progress',
} as const;

export type RouteKeys = keyof typeof ROUTES;
export type RouteValues = (typeof ROUTES)[RouteKeys];

/**
 * Custom navigation hook with enhanced functionality
 * Built on React Router v7.7 for better type safety and convenience
 */
export function useAppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate to a specific route with optional state
   */
  const navigateTo = (route: RouteValues, options?: NavigateOptions) => {
    void navigate(route, options);
  };

  /**
   * Navigate to dashboard
   */
  const goToDashboard = (options?: NavigateOptions) => {
    navigateTo(ROUTES.DASHBOARD, options);
  };

  /**
   * Navigate to habits page
   */
  const goToHabits = (options?: NavigateOptions) => {
    navigateTo(ROUTES.HABITS, options);
  };

  /**
   * Navigate to progress page
   */
  const goToProgress = (options?: NavigateOptions) => {
    navigateTo(ROUTES.PROGRESS, options);
  };

  /**
   * Check if currently on a specific route
   */
  const isOnRoute = (route: RouteValues): boolean => {
    return location.pathname === route;
  };

  /**
   * Check if currently on dashboard
   */
  const isOnDashboard = (): boolean => {
    return isOnRoute(ROUTES.DASHBOARD);
  };

  /**
   * Check if currently on habits page
   */
  const isOnHabits = (): boolean => {
    return isOnRoute(ROUTES.HABITS);
  };

  /**
   * Check if currently on progress page
   */
  const isOnProgress = (): boolean => {
    return isOnRoute(ROUTES.PROGRESS);
  };

  /**
   * Get the current route
   */
  const getCurrentRoute = (): string => {
    return location.pathname;
  };

  /**
   * Navigate back in history
   */
  const goBack = () => {
    void navigate(-1);
  };

  /**
   * Navigate forward in history
   */
  const goForward = () => {
    void navigate(1);
  };

  return {
    // Navigation functions
    navigateTo,
    goToDashboard,
    goToHabits,
    goToProgress,
    goBack,
    goForward,

    // Route checking functions
    isOnRoute,
    isOnDashboard,
    isOnHabits,
    isOnProgress,
    getCurrentRoute,

    // Raw hooks for advanced use cases
    navigate,
    location,
  };
}

/**
 * Utility function to validate if a path is a valid route
 */
export function isValidRoute(path: string): path is RouteValues {
  return Object.values(ROUTES).includes(path as RouteValues);
}
