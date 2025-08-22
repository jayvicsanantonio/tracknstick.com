// Enhanced connectivity monitoring system with comprehensive detection methods
// Provides real-time connectivity status, advanced quality assessment, and event-based notifications

import { IConnectivityMonitor } from '../interfaces';
import { ConnectivityStatus } from '../types';

export class ConnectivityMonitor implements IConnectivityMonitor {
  private status: ConnectivityStatus;
  private subscribers = new Set<(status: ConnectivityStatus) => void>();
  private checkInterval: NodeJS.Timeout | null = null;
  private debounceTimeout: NodeJS.Timeout | null = null;
  private readonly debounceMs = 1000;
  private readonly qualityCheckInterval = 60000; // Check quality every minute
  private qualityInterval: NodeJS.Timeout | null = null;
  private connectionHistory: {
    timestamp: number;
    quality: string;
    responseTime: number;
  }[] = [];
  private readonly historyLimit = 10;

  constructor() {
    this.status = {
      online: navigator.onLine,
      quality: 'good',
      lastOnline: navigator.onLine ? new Date() : null,
      lastOffline: navigator.onLine ? null : new Date(),
    };

    this.setupEventListeners();
    this.startPeriodicChecks();
    this.startQualityMonitoring();
  }

  isOnline(): boolean {
    return this.status.online;
  }

  getStatus(): ConnectivityStatus {
    return { ...this.status };
  }

  subscribe(callback: (status: ConnectivityStatus) => void): () => void {
    this.subscribers.add(callback);

    // Immediately notify with current status
    callback(this.getStatus());

    return () => {
      this.subscribers.delete(callback);
    };
  }

  async checkConnectivity(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    try {
      // Use multiple methods to verify connectivity
      const results = await Promise.allSettled([
        this.pingEndpoint(),
        this.checkNavigatorConnection(),
        this.testImageLoad(),
      ]);

      // Consider online if at least one method succeeds
      const successful = results.filter(
        (result) => result.status === 'fulfilled' && result.value === true,
      ).length;

      return successful > 0;
    } catch {
      return false;
    }
  }

  async assessQuality(): Promise<'poor' | 'good' | 'excellent'> {
    if (!this.status.online) {
      return 'poor';
    }

    try {
      // Run multiple quality assessment methods
      const [pingResult, connectionResult, downloadResult] =
        await Promise.allSettled([
          this.measurePingLatency(),
          this.assessConnectionType(),
          this.measureDownloadSpeed(),
        ]);

      const measurements = {
        ping:
          pingResult.status === 'fulfilled'
            ? pingResult.value
            : { responseTime: Infinity, success: false },
        connection:
          connectionResult.status === 'fulfilled'
            ? connectionResult.value
            : 'unknown',
        download:
          downloadResult.status === 'fulfilled' ? downloadResult.value : 0,
      };

      const quality = this.calculateQualityScore(measurements);

      // Store in history for trend analysis
      this.updateConnectionHistory(quality, measurements.ping.responseTime);

      return quality;
    } catch {
      return 'poor';
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('online', this.handleOnlineEvent.bind(this));
    window.addEventListener('offline', this.handleOfflineEvent.bind(this));

    // Listen for connection changes if supported
    if ('connection' in navigator) {
      const connection = (
        navigator as {
          connection?: {
            addEventListener: (event: string, handler: () => void) => void;
          };
        }
      ).connection;
      connection?.addEventListener(
        'change',
        this.handleConnectionChange.bind(this),
      );
    }
  }

  private startPeriodicChecks(): void {
    // Check connectivity every 30 seconds
    this.checkInterval = setInterval(() => {
      void (async () => {
        const actuallyOnline = await this.checkConnectivity();
        const quality = await this.assessQuality();

        if (actuallyOnline !== this.status.online) {
          this.updateStatus({
            online: actuallyOnline,
            quality,
            lastOnline: actuallyOnline ? new Date() : this.status.lastOnline,
            lastOffline: actuallyOnline ? this.status.lastOffline : new Date(),
          });
        } else if (this.status.online && quality !== this.status.quality) {
          this.updateStatus({ ...this.status, quality });
        }
      })();
    }, 30000);
  }

  private handleOnlineEvent(): void {
    this.debouncedStatusUpdate(async () => {
      const actuallyOnline = await this.checkConnectivity();
      const quality = await this.assessQuality();

      this.updateStatus({
        online: actuallyOnline,
        quality,
        lastOnline: actuallyOnline ? new Date() : this.status.lastOnline,
        lastOffline: actuallyOnline ? this.status.lastOffline : new Date(),
      });
    });
  }

  private handleOfflineEvent(): void {
    this.debouncedStatusUpdate(() => {
      this.updateStatus({
        ...this.status,
        online: false,
        quality: 'poor',
        lastOffline: new Date(),
      });
    });
  }

  private handleConnectionChange(): void {
    this.debouncedStatusUpdate(async () => {
      const actuallyOnline = await this.checkConnectivity();
      const quality = await this.assessQuality();

      this.updateStatus({
        online: actuallyOnline,
        quality,
        lastOnline: actuallyOnline ? new Date() : this.status.lastOnline,
        lastOffline: actuallyOnline ? this.status.lastOffline : new Date(),
      });
    });
  }

  private debouncedStatusUpdate(updateFn: () => void | Promise<void>): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      void (async () => {
        await updateFn();
      })();
    }, this.debounceMs);
  }

  private updateStatus(newStatus: ConnectivityStatus): void {
    const oldStatus = { ...this.status };
    this.status = newStatus;

    // Only notify if status actually changed
    if (this.hasStatusChanged(oldStatus, newStatus)) {
      this.notifySubscribers();
    }
  }

  private hasStatusChanged(
    oldStatus: ConnectivityStatus,
    newStatus: ConnectivityStatus,
  ): boolean {
    return (
      oldStatus.online !== newStatus.online ||
      oldStatus.quality !== newStatus.quality
    );
  }

  private notifySubscribers(): void {
    const currentStatus = this.getStatus();
    this.subscribers.forEach((callback) => {
      try {
        callback(currentStatus);
      } catch (error) {
        console.error('Error in connectivity status callback:', error);
      }
    });
  }

  private async pingEndpoint(): Promise<boolean> {
    try {
      // Use a reliable endpoint for connectivity check
      await fetch('https://httpbin.org/get', {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      });
      return true; // If we reach here, request succeeded
    } catch {
      return false;
    }
  }

  private checkNavigatorConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      if ('connection' in navigator) {
        const connection = (
          navigator as { connection?: { effectiveType?: string } }
        ).connection;
        // Consider effective type of 'slow-2g' or lower as poor connectivity
        const effectiveType = connection?.effectiveType;
        resolve(effectiveType !== 'slow-2g' && effectiveType !== '2g');
      } else {
        resolve(navigator.onLine);
      }
    });
  }

  private testImageLoad(): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve(false);
      }, 3000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      // Use a small, fast-loading image
      img.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>')}`;
    });
  }

  // Enhanced quality assessment methods
  private async measurePingLatency(): Promise<{
    responseTime: number;
    success: boolean;
  }> {
    const startTime = performance.now();
    try {
      await fetch('https://httpbin.org/get', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      });
      const responseTime = performance.now() - startTime;
      return { responseTime, success: true };
    } catch {
      return { responseTime: Infinity, success: false };
    }
  }

  private assessConnectionType(): string {
    if ('connection' in navigator) {
      const connection = (
        navigator as {
          connection?: { effectiveType?: string; downlink?: number };
        }
      ).connection;
      return connection?.effectiveType ?? 'unknown';
    }
    return 'unknown';
  }

  private async measureDownloadSpeed(): Promise<number> {
    try {
      const startTime = performance.now();
      // Use a small test file to measure download speed
      const response = await fetch('https://httpbin.org/bytes/1024', {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) return 0;

      await response.blob();
      const duration = (performance.now() - startTime) / 1000; // Convert to seconds
      const bytes = 1024;
      const kbps = bytes / 1024 / duration; // KB/s

      return kbps;
    } catch {
      return 0;
    }
  }

  private calculateQualityScore(measurements: {
    ping: { responseTime: number; success: boolean };
    connection: string;
    download: number;
  }): 'poor' | 'good' | 'excellent' {
    if (!measurements.ping.success) {
      return 'poor';
    }

    let score = 0;

    // Ping latency scoring (40% weight)
    if (measurements.ping.responseTime < 100) {
      score += 40;
    } else if (measurements.ping.responseTime < 300) {
      score += 30;
    } else if (measurements.ping.responseTime < 1000) {
      score += 20;
    } else {
      score += 10;
    }

    // Connection type scoring (30% weight)
    switch (measurements.connection) {
      case '4g':
      case '5g':
        score += 30;
        break;
      case '3g':
        score += 20;
        break;
      case '2g':
        score += 10;
        break;
      case 'slow-2g':
        score += 5;
        break;
      default:
        score += 15; // Unknown but connected
    }

    // Download speed scoring (30% weight)
    if (measurements.download > 50) {
      // > 50 KB/s
      score += 30;
    } else if (measurements.download > 10) {
      // > 10 KB/s
      score += 20;
    } else if (measurements.download > 1) {
      // > 1 KB/s
      score += 10;
    }

    // Determine final quality based on score
    if (score >= 80) {
      return 'excellent';
    } else if (score >= 50) {
      return 'good';
    } else {
      return 'poor';
    }
  }

  private updateConnectionHistory(quality: string, responseTime: number): void {
    this.connectionHistory.push({
      timestamp: Date.now(),
      quality,
      responseTime,
    });

    // Keep only recent history
    if (this.connectionHistory.length > this.historyLimit) {
      this.connectionHistory = this.connectionHistory.slice(-this.historyLimit);
    }
  }

  private startQualityMonitoring(): void {
    this.qualityInterval = setInterval(() => {
      void (async () => {
        if (this.status.online) {
          const quality = await this.assessQuality();
          if (quality !== this.status.quality) {
            this.updateStatus({ ...this.status, quality });
          }
        }
      })();
    }, this.qualityCheckInterval);
  }

  // TODO(human): Add connection stability metrics
  public getConnectionMetrics(): {
    averageResponseTime: number;
    stabilityScore: number;
    recentQuality: string[];
  } {
    if (this.connectionHistory.length === 0) {
      return {
        averageResponseTime: 0,
        stabilityScore: 0,
        recentQuality: [],
      };
    }

    // TODO(human): Implement stability calculation logic
    // Consider: response time variance, quality changes, connection drops
    // Return metrics that help determine connection reliability

    const averageResponseTime =
      this.connectionHistory.reduce(
        (sum, entry) => sum + entry.responseTime,
        0,
      ) / this.connectionHistory.length;

    const recentQuality = this.connectionHistory.map((entry) => entry.quality);

    return {
      averageResponseTime,
      stabilityScore: 0, // Placeholder - implement stability calculation
      recentQuality,
    };
  }

  // Enhanced subscription with filtered notifications
  subscribeToQualityChanges(
    callback: (status: ConnectivityStatus) => void,
    minQualityChange?: 'poor' | 'good' | 'excellent',
  ): () => void {
    const wrappedCallback = (status: ConnectivityStatus) => {
      if (!minQualityChange) {
        callback(status);
        return;
      }

      const qualityOrder = { poor: 0, good: 1, excellent: 2 };
      const currentLevel = qualityOrder[status.quality];
      const minLevel = qualityOrder[minQualityChange];

      if (currentLevel >= minLevel) {
        callback(status);
      }
    };

    return this.subscribe(wrappedCallback);
  }

  // Network performance insights
  getNetworkInsights(): {
    connectionType: string;
    averageLatency: number;
    qualityTrend: 'improving' | 'stable' | 'degrading';
    recommendations: string[];
  } {
    const connectionType =
      this.connectionHistory.length > 0
        ? this.connectionHistory[this.connectionHistory.length - 1].quality
        : 'unknown';

    const averageLatency =
      this.connectionHistory.length > 0
        ? this.connectionHistory.reduce(
            (sum, entry) => sum + entry.responseTime,
            0,
          ) / this.connectionHistory.length
        : 0;

    // Simple trend analysis
    const recentEntries = this.connectionHistory.slice(-5);
    const qualityTrend = this.analyzeTrend(recentEntries);

    const recommendations = this.generateRecommendations(
      averageLatency,
      connectionType,
    );

    return {
      connectionType,
      averageLatency,
      qualityTrend,
      recommendations,
    };
  }

  private analyzeTrend(
    entries: { quality: string; responseTime: number }[],
  ): 'improving' | 'stable' | 'degrading' {
    if (entries.length < 3) return 'stable';

    const qualityScores = entries.map((entry) => {
      switch (entry.quality) {
        case 'excellent':
          return 3;
        case 'good':
          return 2;
        case 'poor':
          return 1;
        default:
          return 1;
      }
    });

    const firstHalf = qualityScores.slice(
      0,
      Math.floor(qualityScores.length / 2),
    );
    const secondHalf = qualityScores.slice(
      Math.floor(qualityScores.length / 2),
    );

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 0.2) return 'improving';
    if (difference < -0.2) return 'degrading';
    return 'stable';
  }

  private generateRecommendations(
    latency: number,
    connectionType: string,
  ): string[] {
    const recommendations: string[] = [];

    if (latency > 1000) {
      recommendations.push(
        'High latency detected - consider switching networks',
      );
    }

    if (connectionType === 'poor' || connectionType === 'slow-2g') {
      recommendations.push(
        'Poor connection quality - sync operations may be delayed',
      );
    }

    if (this.connectionHistory.length > 5) {
      const recentDrops = this.connectionHistory.filter(
        (entry) => entry.responseTime === Infinity,
      ).length;

      if (recentDrops > 2) {
        recommendations.push(
          'Frequent connection drops detected - enable offline mode',
        );
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Connection quality is good for sync operations');
    }

    return recommendations;
  }

  destroy(): void {
    window.removeEventListener('online', this.handleOnlineEvent.bind(this));
    window.removeEventListener('offline', this.handleOfflineEvent.bind(this));

    if ('connection' in navigator) {
      const connection = (
        navigator as {
          connection?: {
            removeEventListener: (event: string, handler: () => void) => void;
          };
        }
      ).connection;
      connection?.removeEventListener(
        'change',
        this.handleConnectionChange.bind(this),
      );
    }

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    if (this.qualityInterval) {
      clearInterval(this.qualityInterval);
    }

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.subscribers.clear();
    this.connectionHistory = [];
  }
}
