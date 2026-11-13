// Custom hook for accessing theme context
// Provides theme state management and control functions

import { useContext } from 'react';
import { ThemeContext } from '@app/providers/ThemeContext';
import { ThemeContextValue } from '@shared/types/theme';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
