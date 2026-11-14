// Pins which icon each achievement gets: the API's catalogue names a lucide icon per achievement.
// A name the app does not know, or no name, shows the Trophy icon.

import { describe, it, expect } from 'vitest';
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
} from 'lucide-react';
import { getAchievementIcon } from '../achievementIcons';

// Every icon name in the achievement catalogue the API seeds
// (apps/api/src/repositories/achievement.repository.ts).
const CATALOGUE_ICONS = {
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

describe('getAchievementIcon', () => {
  it.each(Object.entries(CATALOGUE_ICONS))(
    'gives the %s achievement icon its lucide icon',
    (name, icon) => {
      expect(getAchievementIcon(name)).toBe(icon);
    },
  );

  it('gives an achievement without an icon the Trophy icon', () => {
    expect(getAchievementIcon(undefined)).toBe(Trophy);
  });

  it('gives an icon name the app does not know the Trophy icon', () => {
    expect(getAchievementIcon('NoSuchIcon')).toBe(Trophy);
  });

  it.each(['toString', 'constructor', '__proto__'])(
    'gives the name of a built-in object property, %s, the Trophy icon',
    (name) => {
      expect(getAchievementIcon(name)).toBe(Trophy);
    },
  );
});
