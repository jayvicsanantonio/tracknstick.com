// The Coach page: the habit coach's chat as a page of its own, at /coach.
// On phones (< sm): uses the same 34px Collapsing Large Title header as Tracker,
// Habits, and Progress, smoothly collapsing into the translucent compact bar once
// the conversation scrolls or the iOS keyboard opens.

import { useState } from 'react';
import { Sparkles, SquarePen } from 'lucide-react';
import { usePageTitle } from '@shared/hooks/usePageTitle';
import { Card, CardHeader, CardTitle } from '@shared/components/ui/card';
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
        'flex flex-col sm:h-[calc(100dvh-14.25rem)] sm:min-h-[24rem]',
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
          'mx-auto flex min-h-0 w-full max-w-7xl flex-1 sm:px-4 md:px-8 2xl:max-w-[90rem]',
          // Clear the floating iOS 26 Liquid Glass tab bar with balanced spacing
          // when keyboard is closed; dock cleanly above the keyboard once typing begins.
          !isKeyboardOpen &&
            'max-sm:pb-[calc(4.5rem+max(env(safe-area-inset-bottom),0.75rem))]',
          isKeyboardOpen && 'max-sm:pb-1',
        )}
      >
        <Card
          variant="glass"
          className="flex min-h-0 w-full flex-1 flex-col overflow-hidden max-sm:rounded-none max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:ring-0 max-sm:backdrop-blur-none dark:max-sm:bg-transparent"
        >
          <CardHeader className="hidden border-b border-(--color-border-primary)/40 px-3 pt-4 pb-4 sm:grid sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset"
                >
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-(--color-foreground) sm:text-2xl">
                    Habit Coach
                  </CardTitle>
                  <p className="mt-0.5 text-sm text-(--color-text-secondary)">
                    Advice grounded in Atomic Habits by James Clear
                  </p>
                </div>
              </div>
              {conversation.messages.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsLogScrolled(false);
                    conversation.clear();
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-(--color-brand-primary)/12 px-3.5 text-xs font-semibold text-(--color-brand-text) ring-1 ring-(--color-brand-primary)/20 transition-colors ring-inset hover:bg-(--color-brand-primary)/20 active:scale-95 dark:text-(--color-brand-text-light)"
                >
                  <SquarePen aria-hidden="true" className="size-3.5" />
                  New chat
                </button>
              ) : null}
            </div>
          </CardHeader>
          <ChatBox
            conversation={conversation}
            onScrollStateChange={setIsLogScrolled}
          />
        </Card>
      </div>
    </section>
  );
}

export default CoachPage;
