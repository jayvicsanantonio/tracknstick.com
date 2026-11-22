import { createContext } from 'react';

export interface MobileShellContextValue {
  openSettings: () => void;
  userImageUrl?: string;
  userInitial: string;
}

const noop = () => undefined;

export const MobileShellContext = createContext<MobileShellContextValue>({
  openSettings: noop,
  userImageUrl: undefined,
  userInitial: '',
});
