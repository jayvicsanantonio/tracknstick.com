import { useContext } from 'react';
import {
  MobileShellContext,
  type MobileShellContextValue,
} from '@/features/layout/context/MobileShellContextDefinition';

export function useMobileShell(): MobileShellContextValue {
  return useContext(MobileShellContext);
}
