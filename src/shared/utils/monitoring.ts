/**
 * Monitoring utilities for React Router rollout
 *
 * These utilities help track performance, errors, and usage patterns
 * during the React Router rollout phase.
 */

interface RouteMetrics {
  loadTime: number[];
  errorCount: number;
  visitCount: number;
  lastVisited: Date;
}

interface NavigationMetrics {
  browserBackCount: number;
  browserForwardCount: number;
  directUrlAccessCount: number;
  linkClickCount: number;
}

class RoutingMonitor {
  private routeMetrics: Record<string, RouteMetrics> = {
    '/': {
      loadTime: [],
      errorCount: 0,
      visitCount: 0,
      lastVisited: new Date(),
    },
    '/habits': {
      loadTime: [],
      errorCount: 0,
      visitCount: 0,
      lastVisited: new Date(),
    },
    '/progress': {
      loadTime: [],
      errorCount: 0,
      visitCount: 0,
      lastVisited: new Date(),
    },
  };

  private navigationMetrics: NavigationMetrics = {
    browserBackCount: 0,
    browserForwardCount: 0,
    directUrlAccessCount: 0,
    linkClickCount: 0,
  };

  private startTime = 0;
  private isEnabled = false;

  constructor() {
    // Routing is now always enabled
    this.isEnabled = true;
    this.setupEventListeners();
    this.detectNavigationType();
  }

  /**
   * Start timing a route load
   */
  startRouteLoad(route: string): void {
    if (!this.isEnabled) return;
    // Initialize route metrics if not exists
    if (!this.routeMetrics[route]) {
      this.routeMetrics[route] = {
        loadTime: [],
        errorCount: 0,
        visitCount: 0,
        lastVisited: new Date(),
      };
    }
    this.startTime = performance.now();
  }

  /**
   * End timing a route load and record metrics
   */
  endRouteLoad(route: string): void {
    if (!this.isEnabled || !this.startTime) return;

    const loadTime = performance.now() - this.startTime;

    if (this.routeMetrics[route]) {
      this.routeMetrics[route].loadTime.push(loadTime);
      this.routeMetrics[route].visitCount++;
      this.routeMetrics[route].lastVisited = new Date();

      // Keep only last 100 load times to prevent memory issues
      if (this.routeMetrics[route].loadTime.length > 100) {
        this.routeMetrics[route].loadTime.shift();
      }
    }

    this.startTime = 0;
    this.logMetrics();
  }

  /**
   * Record a routing error
   */
  recordError(route: string, error: Error): void {
    if (!this.isEnabled) return;

    if (this.routeMetrics[route]) {
      this.routeMetrics[route].errorCount++;
    }

    // Log error for monitoring service
    console.error('[Routing Error]', {
      route,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // Check if we need to trigger alerts
    this.checkErrorThreshold();
  }

  /**
   * Track navigation type
   */
  trackNavigation(type: 'back' | 'forward' | 'direct' | 'link'): void {
    if (!this.isEnabled) return;

    switch (type) {
      case 'back':
        this.navigationMetrics.browserBackCount++;
        break;
      case 'forward':
        this.navigationMetrics.browserForwardCount++;
        break;
      case 'direct':
        this.navigationMetrics.directUrlAccessCount++;
        break;
      case 'link':
        this.navigationMetrics.linkClickCount++;
        break;
    }
  }

  /**
   * Get current metrics summary
   */
  getMetricsSummary(): {
    routes: Record<
      string,
      {
        avgLoadTime: number;
        errorRate: number;
        visitCount: number;
      }
    >;
    navigation: NavigationMetrics;
    overall: {
      totalErrors: number;
      totalVisits: number;
      avgLoadTime: number;
    };
  } {
    const summary = {
      routes: {} as Record<
        string,
        {
          avgLoadTime: number;
          errorRate: number;
          visitCount: number;
        }
      >,
      navigation: this.navigationMetrics,
      overall: {
        totalErrors: 0,
        totalVisits: 0,
        avgLoadTime: 0,
      },
    };

    let totalLoadTime = 0;
    let totalLoadCount = 0;

    Object.entries(this.routeMetrics).forEach(([route, metrics]) => {
      const avgLoadTime = metrics.loadTime.length
        ? metrics.loadTime.reduce((a, b) => a + b, 0) / metrics.loadTime.length
        : 0;

      summary.routes[route] = {
        avgLoadTime: Math.round(avgLoadTime),
        errorRate:
          metrics.visitCount > 0 ? metrics.errorCount / metrics.visitCount : 0,
        visitCount: metrics.visitCount,
      };

      summary.overall.totalErrors += metrics.errorCount;
      summary.overall.totalVisits += metrics.visitCount;
      totalLoadTime += metrics.loadTime.reduce((a, b) => a + b, 0);
      totalLoadCount += metrics.loadTime.length;
    });

    summary.overall.avgLoadTime =
      totalLoadCount > 0 ? Math.round(totalLoadTime / totalLoadCount) : 0;

    return summary;
  }

  /**
   * Setup event listeners for browser navigation
   */
  private setupEventListeners(): void {
    // Track browser back/forward
    window.addEventListener('popstate', () => {
      // Simple heuristic: if performance.navigation exists, use it
      // Otherwise, we'll need to track state manually
      const entries = performance.getEntriesByType(
        'navigation',
      ) as PerformanceNavigationTiming[];
      if (entries.length > 0 && entries[0].type === 'back_forward') {
        // We can't distinguish between back and forward easily
        // For now, we'll count them together
        this.trackNavigation('back');
      }
    });
  }

  /**
   * Detect how the user arrived at the current page
   */
  private detectNavigationType(): void {
    const entries = performance.getEntriesByType(
      'navigation',
    ) as PerformanceNavigationTiming[];

    if (entries.length > 0) {
      const navEntry = entries[0];

      if (navEntry.type === 'navigate') {
        // Could be direct URL or link click
        // If referrer is empty or from different domain, likely direct access
        if (
          !document.referrer ||
          new URL(document.referrer).hostname !== window.location.hostname
        ) {
          this.trackNavigation('direct');
        } else {
          this.trackNavigation('link');
        }
      } else if (navEntry.type === 'reload') {
        // Page refresh, count as direct access
        this.trackNavigation('direct');
      } else if (navEntry.type === 'back_forward') {
        this.trackNavigation('back');
      }
    }
  }

  /**
   * Check if error rate exceeds threshold
   */
  private checkErrorThreshold(): void {
    const summary = this.getMetricsSummary();
    const errorRate =
      summary.overall.totalVisits > 0
        ? summary.overall.totalErrors / summary.overall.totalVisits
        : 0;

    // Alert if error rate exceeds 1%
    if (errorRate > 0.01 && summary.overall.totalVisits > 10) {
      console.error('[ALERT] Error rate exceeds threshold:', {
        errorRate: `${(errorRate * 100).toFixed(2)}%`,
        totalErrors: summary.overall.totalErrors,
        totalVisits: summary.overall.totalVisits,
      });
    }
  }

  /**
   * Log metrics periodically (for debugging during rollout)
   */
  private logMetrics(): void {
    // Only log every 10 visits to avoid console spam
    const totalVisits = Object.values(this.routeMetrics).reduce(
      (sum, metrics) => sum + metrics.visitCount,
      0,
    );

    if (totalVisits % 10 === 0) {
      console.log('[Routing Metrics]', this.getMetricsSummary());
    }
  }

  /**
   * Export metrics for external monitoring service
   */
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.getMetricsSummary(),
      // Feature flag removed - routing is now always enabled
      enabled: this.isEnabled,
    });
  }
}

// Create singleton instance
const routingMonitor = new RoutingMonitor();

/**
 * React hook for route monitoring
 */
export function useRouteMonitoring(route: string) {
  // Start timing when component mounts
  routingMonitor.startRouteLoad(route);

  // End timing after a short delay to ensure component is rendered
  setTimeout(() => {
    routingMonitor.endRouteLoad(route);
  }, 100);
}

/**
 * Error boundary helper for route errors
 */
export function trackNavigationClick(): void {
  routingMonitor.trackNavigation('link');
}
