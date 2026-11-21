// The Coach page: the habit coach's chat as a page of its own, at /coach.
// The conversation comes from ChatConversationProvider, so it survives a visit to another page.

import { usePageTitle } from '@shared/hooks/usePageTitle';
import { Card, CardHeader, CardTitle } from '@shared/components/ui/card';
import { ChatBox } from '@/features/chat/components/ChatBox';
import { useChatConversationContext } from '@/features/chat/hooks/useChatConversationContext';
import { motion } from 'framer-motion';

/**
 * Coach page component
 *
 * Titled like the Habits and Progress pages: a screen-reader heading, and a
 * card header with a title and subtitle. The chat fills the rest of a card
 * the height of the screen, so the message box stays in view and only the
 * conversation scrolls. On phones the card ends above the tab bar.
 *
 * Route: /coach
 */
function CoachPage() {
  usePageTitle('Habit Coach');
  const conversation = useChatConversationContext();

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex h-[calc(100dvh-10.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] min-h-[24rem] flex-col sm:h-[calc(100dvh-14.25rem)]"
    >
      <h1 className="sr-only">Habit Coach</h1>
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 px-2 sm:px-4 md:px-8 2xl:max-w-[90rem]">
        <Card
          variant="glass"
          className="flex min-h-0 w-full flex-1 flex-col overflow-hidden"
        >
          <CardHeader className="px-3 pt-4 sm:px-6 sm:pt-6">
            <div>
              <CardTitle className="mb-2 flex items-center gap-2 text-xl font-bold text-(--color-foreground) sm:text-2xl">
                Habit Coach
              </CardTitle>
              <p className="text-sm text-(--color-text-secondary)">
                Advice grounded in Atomic Habits by James Clear
              </p>
            </div>
          </CardHeader>
          <ChatBox conversation={conversation} />
        </Card>
      </div>
    </motion.section>
  );
}

export default CoachPage;
