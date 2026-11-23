// The signed-out landing page: what Track N' Stick offers and sign-in.
// Phones get a one-screen start of their own (PhoneWelcome); tablet and desktop get a bold hero
// headline, elevated tactile feature cards, and a clean Clerk sign-in stage.

import { SignIn } from '@clerk/clerk-react';
import { PAGE_CONTAINER } from '@shared/constants/layout';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import { useTheme } from '@shared/hooks/useTheme';
import { cn } from '@shared/utils/utils';
import { memo } from 'react';
import {
  BarChart3,
  CalendarCheck2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { clerkAuthAppearance } from './clerkAuthAppearance';
import PhoneWelcome from './PhoneWelcome';
import { welcomeCopy } from './welcomeCopy';

const FEATURES: { Icon: LucideIcon; title: string; detail: string }[] = [
  {
    Icon: CalendarCheck2,
    title: 'Check in daily',
    detail: 'Tap a habit to mark it done. Your streaks build themselves.',
  },
  {
    Icon: BarChart3,
    title: 'See your progress',
    detail: 'A calendar, completion trends and achievements to earn.',
  },
  {
    Icon: Sparkles,
    title: 'Ask the coach',
    detail: 'Advice grounded in Atomic Habits whenever you feel stuck.',
  },
];

/** Tablet and desktop: the hero and feature cards beside Clerk's sign-in form. */
const WideWelcome = memo(function WideWelcome() {
  const { mode } = useTheme();
  const { title, subtitle } = welcomeCopy(mode === 'dark');

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex w-full flex-1 overflow-hidden">
        <div
          className={cn(
            PAGE_CONTAINER,
            'flex flex-1 flex-col justify-center pt-2 pb-[max(env(safe-area-inset-bottom),2rem)] sm:py-6 lg:py-10',
          )}
        >
          <div className="grid w-full items-center gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12 xl:gap-16">
            {/* Left Side - Hero Content & Tactile Feature Cards */}
            <div className="flex flex-col items-center px-1 pt-3 pb-2 text-center sm:px-0 sm:pt-0 lg:items-start lg:text-left">
              <div className="w-full max-w-xl">
                <h1 className="text-[36px] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance text-(--color-brand-primary) sm:text-5xl xl:text-6xl dark:text-(--color-brand-text-light)">
                  {title}
                </h1>
                <p className="mt-2.5 text-[15px] leading-relaxed text-balance text-(--color-brand-tertiary) sm:mt-4 sm:text-lg xl:text-xl dark:text-(--color-text-primary)">
                  {subtitle}
                </p>

                {/* Elevated onboarding feature cards consistent across phone, tablet, and desktop */}
                <ul
                  aria-label="What you get"
                  className="mt-5 grid grid-cols-1 gap-2.5 text-left sm:mt-7 sm:gap-3"
                >
                  {FEATURES.map(({ Icon, title: featureTitle, detail }) => (
                    <li
                      key={featureTitle}
                      className="ios-tracker-card flex flex-row items-center gap-3.5 rounded-[20px] p-3.5 sm:gap-4 sm:p-4"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset sm:size-12 sm:rounded-[15px]">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold tracking-[-0.01em] text-(--color-foreground) sm:text-base">
                          {featureTitle}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-(--color-text-secondary) sm:text-sm">
                          {detail}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Side - Sign In Stage */}
            <div className="flex justify-center pt-1 pb-2 sm:p-0">
              <div className="ios-tracker-card-sm w-full max-w-sm sm:max-w-md sm:rounded-[26px] sm:p-7 lg:p-8">
                <div className="mb-3 text-center sm:mb-5">
                  <h2 className="text-[17px] font-bold tracking-[-0.015em] text-(--color-foreground) sm:text-xl">
                    Start Your Journey
                  </h2>
                  <p className="mt-0.5 text-[13px] text-(--color-text-secondary) sm:mt-1 sm:text-sm">
                    Transform intention into momentum
                  </p>
                </div>
                <SignIn appearance={clerkAuthAppearance} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const Welcome = memo(function Welcome() {
  const isMobile = useIsMobile();

  return isMobile ? <PhoneWelcome /> : <WideWelcome />;
});

export default Welcome;
