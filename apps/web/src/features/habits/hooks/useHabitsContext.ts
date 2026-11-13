import { useContext } from 'react';
import { HabitsStateContext } from '../context/HabitsStateContext';

export function useHabitsContext() {
  const context = useContext(HabitsStateContext);
  if (context === null) {
    throw new Error(
      'useHabitsContext must be used within a HabitsStateProvider',
    );
  }
  return context;
}
