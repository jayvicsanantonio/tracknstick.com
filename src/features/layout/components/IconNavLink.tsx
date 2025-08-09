import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { buttonVariants } from '@shared/components/ui/button-variants';
import { cn } from '@shared/utils/utils';

interface IconNavLinkProps {
  to: string;
  children: ReactNode;
  'aria-label': string;
  onClick?: () => void;
}

export function IconNavLink({
  to,
  children,
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
          'rounded-full',
        )
      }
      {...a11y}
    >
      {children}
    </NavLink>
  );
}

export default IconNavLink;
