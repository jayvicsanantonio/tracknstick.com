// Header navigation link styled as a round tonal button, filled when its route is active.
// Shows only the icon on smaller screens and the icon with a short label from lg up.

import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { buttonVariants } from '@shared/components/ui/button-variants';
import { cn } from '@shared/utils/utils';

interface IconNavLinkProps {
  to: string;
  children: ReactNode;
  /** Short visible label, shown beside the icon on wider screens. */
  label: string;
  'aria-label': string;
  onClick?: () => void;
}

function IconNavLink({
  to,
  children,
  label,
  onClick,
  ...a11y
}: IconNavLinkProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          buttonVariants({
            size: 'icon',
            variant: isActive ? 'brandTonalActive' : 'brandTonal',
          }),
          'rounded-full lg:w-auto lg:px-4',
        )
      }
      {...a11y}
    >
      {children}
      <span className="hidden text-sm font-semibold lg:inline">{label}</span>
    </NavLink>
  );
}

export default IconNavLink;
