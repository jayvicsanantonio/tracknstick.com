// Achievement icon mapping using Lucide React icons
// Maps icon name strings to Lucide React components

import {
  Activity,
  Award,
  BookOpen,
  Building,
  Calendar,
  CheckCircle,
  Crown,
  Flame,
  Heart,
  Medal,
  MessageSquare,
  Moon,
  RefreshCw,
  Rocket,
  Shield,
  Sprout,
  Star,
  Sun,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  User,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { AchievementIcon } from '@tracknstick/contracts';

// The icons the API's achievement catalogue names, ACHIEVEMENT_ICONS in
// packages/contracts. Listing them, rather than looking a name up in all of
// lucide-react, keeps every other lucide icon out of the bundle. The type
// makes a name added to the contracts list fail to compile until it is
// mapped here.
const ACHIEVEMENT_ICONS: Record<AchievementIcon, LucideIcon> = {
  Activity,
  Award,
  BookOpen,
  Building,
  Calendar,
  CheckCircle,
  Crown,
  Flame,
  Heart,
  Medal,
  MessageSquare,
  Moon,
  RefreshCw,
  Rocket,
  Shield,
  Sprout,
  Star,
  Sun,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  User,
  Zap,
};

// Get Lucide icon component by name
export const getAchievementIcon = (iconName?: string): LucideIcon => {
  if (!iconName) return Trophy;

  // Return the icon or fallback to Trophy. An own-property check, so a name
  // such as "toString" does not find a property every object inherits.
  return Object.prototype.hasOwnProperty.call(ACHIEVEMENT_ICONS, iconName)
    ? ACHIEVEMENT_ICONS[iconName as AchievementIcon]
    : Trophy;
};

// Icon color: one brand palette for every category, inverted once earned
export const getIconColorClass = (isEarned: boolean) =>
  isEarned
    ? 'text-(--color-primary-foreground)'
    : 'text-(--color-brand-primary)';

// Icon background: a brand tint, filled with the brand color once earned
export const getIconBackgroundClass = (isEarned: boolean) =>
  isEarned ? 'bg-(--color-brand-primary)' : 'bg-(--color-brand-primary)/12';
