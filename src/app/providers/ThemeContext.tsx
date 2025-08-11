// React context for theme system state management
// Provides theme mode, tokens, and control functions to components

import { createContext } from 'react';
import { ThemeContextValue } from '@shared/types/theme';

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);
