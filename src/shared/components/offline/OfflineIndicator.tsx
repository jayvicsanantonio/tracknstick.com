// Combined offline status indicator component
// Displays both connectivity and sync status in a unified interface

import React from 'react';
import { Card, CardContent } from '@shared/components/ui/card';
import { cn } from '@shared/utils/utils';
import { ConnectivityStatus } from './ConnectivityStatus';
import { SyncStatus } from './SyncStatus';

interface OfflineIndicatorProps {
  className?: string;
  variant?: 'full' | 'compact' | 'minimal';
  layout?: 'horizontal' | 'vertical';
  showActions?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className,
  variant = 'compact',
  layout = 'horizontal',
  showActions = true,
}) => {
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <ConnectivityStatus variant="icon-only" />
        <SyncStatus variant="compact" showActions={false} />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('w-full', className)} variant="glass">
        <CardContent
          className={cn(
            'flex gap-4 py-3',
            layout === 'vertical' ? 'flex-col' : 'items-center',
          )}
        >
          <ConnectivityStatus variant="compact" className="flex-shrink-0" />
          <div
            className={cn(
              'border-(--color-border-primary) border-l',
              layout === 'vertical' ? 'hidden' : 'h-6',
            )}
          />
          <SyncStatus
            variant="compact"
            showActions={showActions}
            className="flex-1"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        'space-y-4',
        layout === 'horizontal' &&
          'grid grid-cols-1 gap-4 space-y-0 md:grid-cols-2',
        className,
      )}
    >
      <ConnectivityStatus variant="full" />
      <SyncStatus variant="full" showActions={showActions} />
    </div>
  );
};
