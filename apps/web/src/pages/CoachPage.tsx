// The Coach page: the habit coach's chat as a page of its own, at /coach.
// On phones (< sm): full-bleed iMessage/ChatGPT iOS layout with compact translucent top bar,
// New Chat button, and visualViewport keyboard docking so the composer rides above the keyboard.

import { SquarePen } from 'lucide-react';
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

  const mobileHeightStyle =
    isMobile && isKeyboardOpen && viewportHeight
      ? { height: `${viewportHeight}px` }
      : undefined;

  return (
    <section
      style={mobileHeightStyle}
      className={cn(
        'flex flex-col sm:h-[calc(100dvh-14.25rem)] sm:min-h-[24rem]',
        isMobile && !mobileHeightStyle && 'h-dvh',
      )}
    >
      <h1 className="sr-only">Habit Coach</h1>

      <MobileNavBar
        compact
        title="Habit Coach"
        subtitle="Atomic Habits"
        trailing={
          conversation.messages.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                conversation.clear();
              }}
              aria-label="New chat"
              className="flex size-9 items-center justify-center rounded-full bg-(--color-brand-primary)/12 text-(--color-brand-primary) transition-transform focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-90"
            >
              <SquarePen aria-hidden="true" className="size-4" />
            </button>
          ) : undefined
        }
      />

      <div
        className={cn(
          'mx-auto flex min-h-0 w-full max-w-7xl flex-1 sm:px-4 md:px-8 2xl:max-w-[90rem]',
          // Clear the floating iOS 26 Liquid Glass tab bar when keyboard is closed;
          // sit flush above the keyboard once typing begins.
          !isKeyboardOpen &&
            'max-sm:pb-[calc(5.25rem+env(safe-area-inset-bottom))]',
          isKeyboardOpen && 'max-sm:pb-1',
        )}
      >
        <Card
          variant="glass"
          className="flex min-h-0 w-full flex-1 flex-col overflow-hidden max-sm:rounded-none max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:ring-0 max-sm:backdrop-blur-none dark:max-sm:bg-transparent"
        >
          <CardHeader className="hidden px-3 pt-4 sm:grid sm:px-6 sm:pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-2 flex items-center gap-2 text-xl font-bold text-(--color-foreground) sm:text-2xl">
                  Habit Coach
                </CardTitle>
                <p className="text-sm text-(--color-text-secondary)">
                  Advice grounded in Atomic Habits by James Clear
                </p>
              </div>
              {conversation.messages.length > 0 ? (
                <button
                  type="button"
                  onClick={() => conversation.clear()}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-(--color-brand-primary)/12 px-3.5 text-xs font-semibold text-(--color-brand-text) transition-colors hover:bg-(--color-brand-primary)/20 dark:text-(--color-brand-text-light)"
                >
                  <SquarePen aria-hidden="true" className="size-3.5" />
                  New chat
                </button>
              ) : null}
            </div>
          </CardHeader>
          <ChatBox conversation={conversation} />
        </Card>
      </div>
    </section>
  );
}

export default CoachPage;
