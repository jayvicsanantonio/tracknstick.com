declare module '@rive-app/react-canvas' {
  import React from 'react';

  export interface UseRiveOptions {
    src: string;
    autoplay?: boolean;
    stateMachines?: string | string[];
  }

  export interface UseRiveResult {
    RiveComponent: React.ComponentType<
      React.ComponentProps<'div'> & { className?: string }
    >;
  }

  export function useRive(options: UseRiveOptions): UseRiveResult;
}
