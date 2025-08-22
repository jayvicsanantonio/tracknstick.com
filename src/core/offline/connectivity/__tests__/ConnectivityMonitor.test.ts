// Unit tests for enhanced ConnectivityMonitor class
// Tests multiple detection methods, quality assessment, and event subscriptions

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConnectivityMonitor } from '../ConnectivityMonitor';
import { ConnectivityStatus } from '../../types';

// Mock the global fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock navigator
const mockNavigator = {
  onLine: true,
  connection: {
    effectiveType: '4g',
    downlink: 10,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
};

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// Mock performance
const mockPerformance = {
  now: vi.fn(() => Date.now()),
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock Image constructor
const mockImage = {
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: '',
};

global.Image = vi.fn(() => mockImage) as any;

// Mock window event listeners
const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

// Mock AbortSignal.timeout
const mockAbortSignal = {
  timeout: vi.fn(() => ({ aborted: false })),
};

global.AbortSignal = mockAbortSignal as any;

describe('ConnectivityMonitor', () => {
  let monitor: ConnectivityMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigator.onLine = true;
    mockPerformance.now.mockReturnValue(1000);
    monitor = new ConnectivityMonitor();
  });

  afterEach(() => {
    monitor.destroy();
  });

  describe('basic connectivity status', () => {
    it('should initialize with navigator online status', () => {
      expect(monitor.isOnline()).toBe(true);
      const status = monitor.getStatus();
      expect(status.online).toBe(true);
      expect(status.quality).toBe('good');
      expect(status.lastOnline).toBeInstanceOf(Date);
    });

    it('should handle offline initialization', () => {
      mockNavigator.onLine = false;
      const offlineMonitor = new ConnectivityMonitor();

      expect(offlineMonitor.isOnline()).toBe(false);
      const status = offlineMonitor.getStatus();
      expect(status.online).toBe(false);
      expect(status.lastOffline).toBeInstanceOf(Date);

      offlineMonitor.destroy();
    });

    it('should return immutable status copy', () => {
      const status1 = monitor.getStatus();
      const status2 = monitor.getStatus();

      expect(status1).not.toBe(status2); // Different objects
      expect(status1).toEqual(status2); // Same content
    });
  });

  describe('subscription system', () => {
    it('should allow subscribing to status changes', () => {
      const callback = vi.fn();
      const unsubscribe = monitor.subscribe(callback);

      // Should immediately notify with current status
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          online: true,
          quality: 'good',
        }),
      );

      expect(typeof unsubscribe).toBe('function');
    });

    it('should notify all subscribers on status change', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      monitor.subscribe(callback1);
      monitor.subscribe(callback2);

      // Clear initial notifications
      vi.clearAllMocks();

      // Simulate status change by calling private method
      (monitor as any).updateStatus({
        online: false,
        quality: 'poor',
        lastOnline: new Date(),
        lastOffline: new Date(),
      });

      expect(callback1).toHaveBeenCalledWith(
        expect.objectContaining({
          online: false,
          quality: 'poor',
        }),
      );
      expect(callback2).toHaveBeenCalledWith(
        expect.objectContaining({
          online: false,
          quality: 'poor',
        }),
      );
    });

    it('should unsubscribe correctly', () => {
      const callback = vi.fn();
      const unsubscribe = monitor.subscribe(callback);

      // Clear initial notification
      vi.clearAllMocks();

      unsubscribe();

      // Simulate status change
      (monitor as any).updateStatus({
        online: false,
        quality: 'poor',
        lastOnline: new Date(),
        lastOffline: new Date(),
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle subscription callback errors gracefully', () => {
      const goodCallback = vi.fn();
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Subscribe good callback first
      monitor.subscribe(goodCallback);

      // Create error callback that will throw during notification
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });

      // Add error callback to subscribers manually to avoid initial notification error
      (monitor as any).subscribers.add(errorCallback);

      // Clear initial notifications
      vi.clearAllMocks();

      // Simulate status change
      (monitor as any).updateStatus({
        online: false,
        quality: 'poor',
        lastOnline: new Date(),
        lastOffline: new Date(),
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(goodCallback).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('quality-based subscriptions', () => {
    it('should filter notifications by minimum quality', () => {
      const callback = vi.fn();
      monitor.subscribeToQualityChanges(callback, 'good');

      // Clear initial notification
      vi.clearAllMocks();

      // Should not notify for poor quality
      (monitor as any).updateStatus({
        online: true,
        quality: 'poor',
        lastOnline: new Date(),
        lastOffline: null,
      });

      expect(callback).not.toHaveBeenCalled();

      // Should notify for good quality
      (monitor as any).updateStatus({
        online: true,
        quality: 'good',
        lastOnline: new Date(),
        lastOffline: null,
      });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          quality: 'good',
        }),
      );
    });

    it('should notify for quality levels at or above minimum', () => {
      const callback = vi.fn();
      monitor.subscribeToQualityChanges(callback, 'good');

      // Clear initial notification
      vi.clearAllMocks();

      // Should notify for excellent quality (above minimum)
      (monitor as any).updateStatus({
        online: true,
        quality: 'excellent',
        lastOnline: new Date(),
        lastOffline: null,
      });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          quality: 'excellent',
        }),
      );
    });
  });

  describe('connectivity checking', () => {
    beforeEach(() => {
      mockFetch.mockClear();
    });

    it('should return false when navigator is offline', async () => {
      mockNavigator.onLine = false;
      const result = await monitor.checkConnectivity();
      expect(result).toBe(false);
    });

    it('should test multiple detection methods', async () => {
      mockNavigator.onLine = true;

      // Mock successful fetch responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          blob: () => Promise.resolve(new Blob()),
        }) // ping
        .mockResolvedValueOnce({
          ok: true,
          blob: () => Promise.resolve(new Blob()),
        }); // download test

      // Mock image load success
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 10);

      const result = await monitor.checkConnectivity();
      expect(result).toBe(true);
    });

    it('should return true if at least one method succeeds', async () => {
      mockNavigator.onLine = true;

      // Mock one successful and one failed fetch
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          blob: () => Promise.resolve(new Blob()),
        });

      // Mock image load success
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 10);

      const result = await monitor.checkConnectivity();
      expect(result).toBe(true);
    });

    it('should return false if all methods fail', async () => {
      mockNavigator.onLine = true;

      // Mock all fetches failing
      mockFetch.mockRejectedValue(new Error('Network error'));

      // Make connection check return false
      const originalConnection = mockNavigator.connection;
      delete (mockNavigator as any).connection;

      // Mock image load failure immediately
      const originalImage = global.Image;
      global.Image = vi.fn(() => {
        const img = {
          onload: null as (() => void) | null,
          onerror: null as (() => void) | null,
          src: '',
        };
        // Immediately trigger error when src is set
        Object.defineProperty(img, 'src', {
          set: function () {
            setTimeout(() => {
              if (img.onerror) img.onerror();
            }, 1);
          },
        });
        return img;
      }) as any;

      const result = await monitor.checkConnectivity();
      expect(result).toBe(false);

      // Restore
      mockNavigator.connection = originalConnection;
      global.Image = originalImage;
    });
  });

  describe('quality assessment', () => {
    beforeEach(() => {
      mockFetch.mockClear();
      mockPerformance.now.mockClear();
    });

    it('should return poor quality when offline', async () => {
      (monitor as any).status = { online: false };
      const quality = await monitor.assessQuality();
      expect(quality).toBe('poor');
    });

    it('should assess good quality for decent connections', async () => {
      (monitor as any).status = { online: true };

      // Directly test the quality calculation with known good values
      const measurements = {
        ping: { responseTime: 150, success: true },
        connection: '4g',
        download: 25,
      };

      const quality = (monitor as any).calculateQualityScore(measurements);
      expect(quality).toBe('good');
    });

    it('should assess poor quality for slow connections', async () => {
      (monitor as any).status = { online: true };

      // Mock slow response times
      mockPerformance.now
        .mockReturnValueOnce(1000) // start ping
        .mockReturnValueOnce(3000) // end ping (2000ms)
        .mockReturnValueOnce(4000) // start download
        .mockReturnValueOnce(10000); // end download (6000ms)

      mockFetch
        .mockResolvedValueOnce({ ok: true }) // ping
        .mockResolvedValueOnce({
          ok: true,
          blob: () => Promise.resolve(new Blob()),
        }); // download

      mockNavigator.connection.effectiveType = 'slow-2g';

      const quality = await monitor.assessQuality();
      expect(quality).toBe('poor');
    });

    it('should handle measurement failures gracefully', async () => {
      (monitor as any).status = { online: true };

      // Mock all measurements failing
      mockFetch.mockRejectedValue(new Error('Network error'));

      const quality = await monitor.assessQuality();
      expect(quality).toBe('poor');
    });
  });

  describe('connection metrics and insights', () => {
    it('should return empty metrics when no history exists', () => {
      const metrics = monitor.getConnectionMetrics();

      expect(metrics.averageResponseTime).toBe(0);
      expect(metrics.stabilityScore).toBe(0);
      expect(metrics.recentQuality).toEqual([]);
    });

    it('should calculate average response time from history', () => {
      // Add some history data
      (monitor as any).connectionHistory = [
        { timestamp: Date.now(), quality: 'good', responseTime: 100 },
        { timestamp: Date.now(), quality: 'excellent', responseTime: 200 },
        { timestamp: Date.now(), quality: 'good', responseTime: 300 },
      ];

      const metrics = monitor.getConnectionMetrics();
      expect(metrics.averageResponseTime).toBe(200); // (100 + 200 + 300) / 3
      expect(metrics.recentQuality).toEqual(['good', 'excellent', 'good']);
    });

    it('should provide network insights with recommendations', () => {
      // Add history with high latency
      (monitor as any).connectionHistory = [
        { timestamp: Date.now(), quality: 'poor', responseTime: 2000 },
        { timestamp: Date.now(), quality: 'poor', responseTime: 1500 },
      ];

      const insights = monitor.getNetworkInsights();

      expect(insights.connectionType).toBe('poor');
      expect(insights.averageLatency).toBe(1750);
      expect(insights.recommendations).toContain(
        'High latency detected - consider switching networks',
      );
    });

    it('should analyze quality trends correctly', () => {
      // Add history showing improvement
      (monitor as any).connectionHistory = [
        { timestamp: Date.now() - 5000, quality: 'poor', responseTime: 1000 },
        { timestamp: Date.now() - 4000, quality: 'poor', responseTime: 900 },
        { timestamp: Date.now() - 3000, quality: 'good', responseTime: 500 },
        { timestamp: Date.now() - 2000, quality: 'good', responseTime: 400 },
        {
          timestamp: Date.now() - 1000,
          quality: 'excellent',
          responseTime: 100,
        },
      ];

      const insights = monitor.getNetworkInsights();
      expect(insights.qualityTrend).toBe('improving');
    });

    it('should provide positive recommendations for good connections', () => {
      // Add history with good performance
      (monitor as any).connectionHistory = [
        { timestamp: Date.now(), quality: 'excellent', responseTime: 100 },
        { timestamp: Date.now(), quality: 'good', responseTime: 150 },
      ];

      const insights = monitor.getNetworkInsights();
      expect(insights.recommendations).toContain(
        'Connection quality is good for sync operations',
      );
    });

    it('should detect frequent connection drops', () => {
      // Add history with many failures
      (monitor as any).connectionHistory = [
        { timestamp: Date.now(), quality: 'poor', responseTime: Infinity },
        { timestamp: Date.now(), quality: 'poor', responseTime: Infinity },
        { timestamp: Date.now(), quality: 'poor', responseTime: Infinity },
        { timestamp: Date.now(), quality: 'good', responseTime: 200 },
        { timestamp: Date.now(), quality: 'poor', responseTime: Infinity },
        { timestamp: Date.now(), quality: 'good', responseTime: 150 },
      ];

      const insights = monitor.getNetworkInsights();
      expect(insights.recommendations).toContain(
        'Frequent connection drops detected - enable offline mode',
      );
    });
  });

  describe('event listener setup and cleanup', () => {
    it('should setup event listeners on construction', () => {
      expect(mockWindow.addEventListener).toHaveBeenCalledWith(
        'online',
        expect.any(Function),
      );
      expect(mockWindow.addEventListener).toHaveBeenCalledWith(
        'offline',
        expect.any(Function),
      );
      expect(mockNavigator.connection.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      );
    });

    it('should cleanup event listeners on destroy', () => {
      monitor.destroy();

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith(
        'online',
        expect.any(Function),
      );
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith(
        'offline',
        expect.any(Function),
      );
      expect(mockNavigator.connection.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      );
    });

    it('should clear intervals on destroy', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      // Trigger some debounced updates to create timeouts
      (monitor as any).debouncedStatusUpdate(() => {});

      monitor.destroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should clear subscribers and history on destroy', () => {
      const callback = vi.fn();
      monitor.subscribe(callback);

      // Add some history
      (monitor as any).connectionHistory = [
        { timestamp: Date.now(), quality: 'good', responseTime: 100 },
      ];

      monitor.destroy();

      expect((monitor as any).subscribers.size).toBe(0);
      expect((monitor as any).connectionHistory).toEqual([]);
    });
  });

  describe('history management', () => {
    it('should limit connection history to configured size', () => {
      const historyLimit = (monitor as any).historyLimit;

      // Add more entries than the limit
      for (let i = 0; i < historyLimit + 5; i++) {
        (monitor as any).updateConnectionHistory('good', 100 + i);
      }

      expect((monitor as any).connectionHistory.length).toBe(historyLimit);

      // Should keep the most recent entries
      const lastEntry = (monitor as any).connectionHistory[
        (monitor as any).connectionHistory.length - 1
      ];
      expect(lastEntry.responseTime).toBe(100 + historyLimit + 4);
    });

    it('should include timestamp in history entries', () => {
      (monitor as any).updateConnectionHistory('excellent', 50);

      const history = (monitor as any).connectionHistory;
      expect(history).toHaveLength(1);
      expect(history[0]).toHaveProperty('timestamp');
      expect(history[0]).toHaveProperty('quality', 'excellent');
      expect(history[0]).toHaveProperty('responseTime', 50);
    });
  });

  describe('connection type assessment', () => {
    it('should return connection type from navigator', async () => {
      mockNavigator.connection.effectiveType = '5g';
      const connectionType = await (monitor as any).assessConnectionType();
      expect(connectionType).toBe('5g');
    });

    it('should return unknown when connection API unavailable', async () => {
      const originalConnection = mockNavigator.connection;
      delete (mockNavigator as any).connection;

      const connectionType = await (monitor as any).assessConnectionType();
      expect(connectionType).toBe('unknown');

      // Restore
      mockNavigator.connection = originalConnection;
    });
  });

  describe('debounced status updates', () => {
    it('should debounce rapid status changes', () => {
      const callback = vi.fn();
      monitor.subscribe(callback);

      // Clear initial notification
      vi.clearAllMocks();

      // Simulate rapid offline/online events
      (monitor as any).handleOfflineEvent();
      (monitor as any).handleOnlineEvent();
      (monitor as any).handleOfflineEvent();

      // Should not trigger immediate updates due to debouncing
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle missing connection API gracefully', () => {
      const originalConnection = mockNavigator.connection;
      delete (mockNavigator as any).connection;

      const monitorWithoutConnection = new ConnectivityMonitor();
      expect(monitorWithoutConnection.isOnline()).toBe(true); // Should still work

      monitorWithoutConnection.destroy();

      // Restore
      mockNavigator.connection = originalConnection;
    });

    it('should handle performance API unavailability', async () => {
      const originalPerformance = global.performance;
      delete (global as any).performance;

      // Should not throw errors
      const result = await monitor.checkConnectivity();
      expect(typeof result).toBe('boolean');

      // Restore
      global.performance = originalPerformance;
    });

    it('should handle AbortSignal unavailability gracefully', async () => {
      const originalAbortSignal = global.AbortSignal;
      delete (global as any).AbortSignal;

      mockFetch.mockResolvedValue({ ok: true });

      // Should still work without timeout
      const result = await monitor.checkConnectivity();
      expect(typeof result).toBe('boolean');

      // Restore
      global.AbortSignal = originalAbortSignal;
    });
  });
});
