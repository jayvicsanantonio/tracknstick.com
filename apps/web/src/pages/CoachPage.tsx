// The Coach page: the habit coach's chat as a page of its own, at /coach.
// Shares one unified open-canvas layout across phone, tablet, and desktop:
// Collapsing Large Title on phones, matching Large Title header on wider screens,
// elevated hero & suggestion cards, and a floating rounded pill composer.

import { useState } from 'react';
import { SquarePen } from 'lucide-react';
import { usePageTitle } from '@shared/hooks/usePageTitle';
import { ChatBox } from '@/features/chat/components/ChatBox';
import { useChatConversationContext } from '@/features/chat/hooks/useChatConversationContext';
import MobileNavBar from '@/features/layout/components/MobileNavBar';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import { useVisualViewport } from '@shared/hooks/useVisualViewport';
import { triggerHaptic } from '@shared/utils/haptics';
import { cn } from '@shared/utils/utils';

function CoachPage() {
  usePageTitle('Habit Coach');
  const conversation = useChatConversationContext();
  const isMobile = useIsMobile();
  const { height: viewportHeight, isKeyboardOpen } = useVisualViewport();
  const [isLogScrolled, setIsLogScrolled] = useState(false);

  const mobileHeightStyle =
    isMobile && isKeyboardOpen && viewportHeight
      ? { height: `${viewportHeight}px` }
      : undefined;

  return (
    <section
      style={mobileHeightStyle}
      className={cn(
        // Exact viewport minus desktop Header (6rem) + Footer (3.75rem) = 9.75rem
        // so moving between Tracker and Coach keeps the footer stationary.
        'flex flex-col sm:h-[calc(100dvh-9.75rem)] sm:min-h-[24rem]',
        !mobileHeightStyle && 'max-sm:h-dvh',
      )}
    >
      <h1 className="sr-only">Habit Coach</h1>

      <MobileNavBar
        title="Habit Coach"
        compact={isKeyboardOpen}
        collapsed={isLogScrolled}
        trailing={
          conversation.messages.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsLogScrolled(false);
                conversation.clear();
              }}
              aria-label="New chat"
              className="flex size-9 items-center justify-center rounded-full bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/22 transition-transform ring-inset focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-90"
            >
              <SquarePen aria-hidden="true" className="size-4" />
            </button>
          ) : undefined
        }
      />

      <div
        className={cn(
          'mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col sm:px-4 md:px-8 2xl:max-w-[90rem]',
          // Clear the floating iOS 26 Liquid Glass tab bar with balanced spacing
          // when keyboard is closed; dock cleanly above the keyboard once typing begins.
          !isKeyboardOpen &&
            'max-sm:pb-[calc(4.5rem+max(env(safe-area-inset-bottom),0.75rem))]',
          isKeyboardOpen && 'max-sm:pb-1',
        )}
      >
        {/* Tablet & desktop page header matching Tracker, Habits, and Progress */}
        <div className="mb-3 hidden shrink-0 items-center justify-between gap-4 pt-1 sm:flex">
          <div>
            <h2 className="text-[32px] leading-none font-extrabold tracking-[-0.025em] text-(--color-foreground)">
              Habit Coach
            </h2>
            <p className="mt-1.5 text-sm text-(--color-text-secondary)">
              Advice grounded in Atomic Habits by James Clear
            </p>
          </div>
          {conversation.messages.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setIsLogScrolled(false);
                conversation.clear();
              }}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-(--color-brand-primary)/12 px-3.5 text-xs font-semibold text-(--color-brand-text) ring-1 ring-(--color-brand-primary)/20 transition-[background-color,transform] ring-inset hover:bg-(--color-brand-primary)/20 focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-95 dark:text-(--color-brand-text-light)"
            >
              <SquarePen aria-hidden="true" className="size-3.5" />
              New chat
            </button>
          ) : null}
        </div>

        <ChatBox
          conversation={conversation}
          onScrollStateChange={setIsLogScrolled}
        />
      </div>
    </section>
  );
}

export default CoachPage;
