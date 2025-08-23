/**
 * Component Template
 *
 * Use this template when creating new React components.
 * Replace ComponentName with your actual component name.
 *
 * Usage:
 * 1. Copy this file to your component location
 * 2. Rename to ComponentName.tsx
 * 3. Replace all instances of ComponentName
 * 4. Update props interface
 * 5. Implement component logic
 * 6. Add tests in __tests__/ComponentName.test.tsx
 */

import React from 'react';
import { cn } from '@/shared/utils/utils';

// ============================================================================
// Types
// ============================================================================

export interface ComponentNameProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Children elements
   */
  children?: React.ReactNode;
  // Add your props here
}

// ============================================================================
// Component
// ============================================================================

/**
 * ComponentName
 *
 * Brief description of what this component does.
 *
 * @example
 * ```tsx
 * <ComponentName className="custom-class">
 *   Content
 * </ComponentName>
 * ```
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  className,
  children,
  ...props
}) => {
  // Add your component logic here

  return (
    <div className={cn('component-name', className)} {...props}>
      {children}
    </div>
  );
};

// Set display name for debugging
ComponentName.displayName = 'ComponentName';

// Default export for lazy loading
export default ComponentName;
