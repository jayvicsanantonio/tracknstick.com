// Component to display current connectivity status
// Shows online/offline status with visual indicators and connection quality information

import React from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@shared/components/ui/card';
import { cn } from '@shared/utils/utils';
import { useOffline } from '@app/providers/OfflineContext';

interface ConnectivityStatusProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon-only';
}

export const ConnectivityStatus: React.FC<ConnectivityStatusProps> = ({
  className,
  variant = 'compact',
}) => {
  const { isOnline, connectivityStatus } = useOffline();

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }

    switch (connectivityStatus.quality) {
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'good':
      case 'excellent':
        return <Wifi className="h-4 w-4 text-green-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline';
    }

    switch (connectivityStatus.quality) {
      case 'poor':
        return 'Poor Connection';
      case 'good':
        return 'Good Connection';
      case 'excellent':
        return 'Excellent Connection';
      default:
        return 'Online';
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600 dark:text-red-400';

    switch (connectivityStatus.quality) {
      case 'poor':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'good':
      case 'excellent':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (variant === 'icon-only') {
    return (
      <div
        className={cn('flex items-center', className)}
        title={getStatusText()}
      >
        {getStatusIcon()}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        {getStatusIcon()}
        <span className={getStatusColor()}>{getStatusText()}</span>
      </div>
    );
  }

  return (
    <Card className={cn('w-full', className)} variant="subtle">
      <CardContent className="flex items-center gap-3 py-3">
        {getStatusIcon()}
        <div className="flex-1">
          <div className={cn('font-medium', getStatusColor())}>
            {getStatusText()}
          </div>
          {connectivityStatus.lastOffline && (
            <div className="text-(--color-text-secondary) text-xs">
              Last offline: {connectivityStatus.lastOffline.toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
