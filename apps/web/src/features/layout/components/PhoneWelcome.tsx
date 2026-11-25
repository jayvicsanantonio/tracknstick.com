// The signed-out welcome page on a phone: one screen that says what the app is and how to start.
// Sign-up leads in thumb reach at the bottom; both it and sign-in open Clerk's form in a bottom sheet.

import { memo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BarChart3,
  CalendarCheck2,
  Moon,
  Sparkles,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from '@shared/hooks/useTheme';
import { isSplashVisible } from '@shared/hooks/useHideSplash';
import { triggerHaptic } from '@shared/utils/haptics';
import WelcomeAuthSheet, { type WelcomeAuthMode } from './WelcomeAuthSheet';
import { welcomeCopy } from './welcomeCopy';

const STEPS: { Icon: LucideIcon; title: string; detail: string }[] = [
  {
    Icon: CalendarCheck2,
    title: 'Check in daily',
    detail: 'Tap a habit to mark it done.',
  },
  {
    Icon: BarChart3,
    title: 'See your progress',
    detail: 'Streaks, a calendar and achievements.',
  },
  {
    Icon: Sparkles,
    title: 'Ask the coach',
    detail: 'Advice grounded in Atomic Habits.',
  },
];

// The Daily Tracker's completed ring and check, as the app icon draws them,
// in the theme's brand colours: the ring from its top, clockwise.
const RING = 'M100 17a83 83 0 1 1 0 166a83 83 0 1 1 0-166';
const CHECK = 'M10 34L25 49L54 17';

/** The app icon's medallion, drawing its ring closed and its check in. */
const WelcomeMedallion = memo(function WelcomeMedallion() {
  const reduceMotion = useReducedMotion();
  // When opened under the launch splash, the splash has just drawn the same
  // ring and check; mount settled so the reveal never replays or cuts mid-draw.
  const [openedUnderSplash] = useState(isSplashVisible);
  const drawn = { pathLength: 1 };
  const from = reduceMotion || openedUnderSplash ? drawn : { pathLength: 0 };

  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
      className="size-28 drop-shadow-[0_10px_24px_color-mix(in_oklab,var(--color-brand-primary)_28%,transparent)]"
    >
      <defs>
        <linearGradient
          id="welcome-ring"
          gradientUnits="userSpaceOnUse"
          x1="18"
          y1="18"
          x2="182"
          y2="182"
        >
          <stop
            offset="0"
            className="[stop-color:var(--color-brand-text-light)] dark:[stop-color:var(--color-brand-text)]"
          />
          <stop
            offset="0.48"
            className="[stop-color:var(--color-brand-primary)]"
          />
          <stop
            offset="1"
            className="[stop-color:var(--color-brand-secondary)] dark:[stop-color:var(--color-brand-tertiary)]"
          />
        </linearGradient>
      </defs>
      <circle
        cx="100"
        cy="100"
        r="67"
        className="fill-(--color-brand-primary)/12"
      />
      <circle
        cx="100"
        cy="100"
        r="67"
        fill="none"
        strokeWidth="0.85"
        className="stroke-(--color-brand-primary)/30"
      />
      <motion.path
        d={RING}
        fill="none"
        stroke="url(#welcome-ring)"
        strokeWidth="14.5"
        initial={from}
        animate={drawn}
        transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1], delay: 0.15 }}
      />
      <g transform="translate(50 50) scale(1.5625)">
        <motion.path
          d={CHECK}
          fill="none"
          strokeWidth="8.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-(--color-brand-primary)"
          initial={from}
          animate={drawn}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.95 }}
        />
      </g>
    </svg>
  );
});

const PhoneWelcome = memo(function PhoneWelcome() {
  const { mode, toggleMode } = useTheme();
  const { title, subtitle } = welcomeCopy(mode === 'dark');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [authMode, setAuthMode] = useState<WelcomeAuthMode>('signUp');

  const openSheet = (next: WelcomeAuthMode) => {
    triggerHaptic(next === 'signUp' ? 'medium' : 'light');
    setAuthMode(next);
    setSheetOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar: the app icon and name, and the appearance toggle. */}
      <div className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),0.75rem)] pb-2">
        <div className="flex items-center gap-2.5">
          <img
            src="/icons/favicon.svg"
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-[9px] shadow-sm"
          />
          <span className="text-[16px] font-bold tracking-tight text-(--color-foreground)">
            Track N&apos; Stick
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('selection');
            toggleMode();
          }}
          aria-label="Toggle Theme"
          className="ios-grouped-card flex size-10 items-center justify-center rounded-full text-(--color-brand-primary) active:scale-92"
        >
          <Sun aria-hidden="true" className="size-5 dark:hidden" />
          <Moon aria-hidden="true" className="hidden size-5 dark:block" />
        </button>
      </div>

      {/* What the app is, and how it works. */}
      <div className="flex flex-1 flex-col justify-center px-5 py-4">
        <div className="flex flex-col items-center text-center">
          <WelcomeMedallion />
          <h1 className="mt-5 text-[34px] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance text-(--color-brand-primary) dark:text-(--color-brand-text-light)">
            {title}
          </h1>
          <p className="mt-2 max-w-[19rem] text-[15px] leading-relaxed text-balance text-(--color-text-secondary)">
            {subtitle}
          </p>
        </div>

        <ol
          aria-label="How it works"
          className="ios-grouped-card mt-7 divide-y divide-(--color-border-primary)/50 overflow-hidden rounded-[20px]"
        >
          {STEPS.map(({ Icon, title: stepTitle, detail }) => (
            <li key={stepTitle} className="flex items-center gap-3.5 px-4 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-(--color-brand-primary)/14 text-(--color-brand-primary)">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold tracking-[-0.01em] text-(--color-foreground)">
                  {stepTitle}
                </span>
                <span className="block text-[13px] leading-snug text-(--color-text-secondary)">
                  {detail}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* The way in, in thumb reach; it stays on screen when a short phone
          has to scroll. */}
      <div className="sticky bottom-0 bg-linear-to-t from-(--color-background) from-70% to-transparent px-5 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <button
          type="button"
          onClick={() => openSheet('signUp')}
          className="flex h-[52px] w-full touch-manipulation items-center justify-center rounded-2xl bg-(--color-brand-primary) text-[17px] font-semibold text-(--color-primary-foreground) shadow-[0_8px_20px_color-mix(in_oklab,var(--color-brand-primary)_30%,transparent)] transition-transform active:scale-[0.98]"
        >
          Get started
        </button>
        <button
          type="button"
          onClick={() => openSheet('signIn')}
          className="mt-1 flex min-h-11 w-full touch-manipulation items-center justify-center text-[15px] font-semibold text-(--color-brand-primary) active:opacity-60"
        >
          I already have an account
        </button>
      </div>

      <WelcomeAuthSheet
        open={sheetOpen}
        mode={authMode}
        onOpenChange={setSheetOpen}
        onModeChange={setAuthMode}
      />
    </div>
  );
});

export default PhoneWelcome;
