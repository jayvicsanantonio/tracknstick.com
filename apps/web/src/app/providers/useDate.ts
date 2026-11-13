// Accessor for the date context
// Throws outside the provider rather than handing back a plausible fake

import { useContext } from 'react';
import { DateContext, DateContextProps } from '@app/providers/DateContext';

export function useDate(): DateContextProps {
  const context = useContext(DateContext);

  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }

  return context;
}
