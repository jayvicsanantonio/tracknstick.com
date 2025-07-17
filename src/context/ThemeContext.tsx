import { createContext } from 'react';

interface ThemeContextProps {
  toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  toggleDarkMode: () => {
    // This is intentionally empty as it will be implemented by the provider
  },
});
