// Header navigation link styled to match the phone Liquid Glass tab bar:
// clean ghost pill at rest with a spring-animated Liquid Glass lens when active.
// Shows only the icon on tablet widths and the icon with a short label from lg up.

import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { IOS_SPRING_TAB } from '@shared/utils/motion';
import { preloadChunk, type PreloadTarget } from '@shared/utils/preloadRoutes';
import { cn } from '@shared/utils/utils';

interface IconNavLinkProps {
  to: string;
  children: ReactNode;
  /** Short visible label, shown beside the icon on wider screens. */
  label: string;
  /** Optional route chunk to warm up on pointer hover. */
  preload?: PreloadTarget;
  'aria-label': string;
  onClick?: () => void;
}

function IconNavLink({
  to,
  children,
  label,
  preload,
  onClick,
  ...a11y
}: IconNavLinkProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      onPointerEnter={() => {
        if (preload) preloadChunk(preload);
      }}
      className={({ isActive }) =>
        cn(
          'relative z-10 inline-flex size-11 items-center justify-center gap-2 rounded-full text-sm whitespace-nowrap transition-[color,background-color,transform] outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) active:scale-95 lg:w-auto lg:px-4',
          isActive
            ? 'font-semibold text-(--color-brand-tertiary) dark:text-(--color-brand-primary)'
            : 'font-medium text-(--color-text-secondary) hover:bg-(--color-brand-primary)/8 hover:text-(--color-foreground)',
        )
      }
      {...a11y}
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <motion.span
              layoutId="desktop-liquid-tab-lens"
              transition={
                prefersReducedMotion ? { duration: 0 } : IOS_SPRING_TAB
              }
              aria-hidden="true"
              className="ios-liquid-lens absolute inset-0 -z-10 rounded-full"
            />
          ) : null}
          {children}
          <span className="hidden lg:inline">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default IconNavLink;
