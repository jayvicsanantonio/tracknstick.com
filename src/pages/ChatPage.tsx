import { usePageTitle } from '@shared/hooks/usePageTitle';
import { useRouteMonitoring } from '@shared/utils/monitoring';
import { motion } from 'framer-motion';
import { Chat } from '@/features/chat/components/Chat';

/**
 * Chat page component
 *
 * AI-powered habit coach powered by Atomic Habits.
 * Users can ask questions about habit formation and get advice
 * based on James Clear's book.
 *
 * Route: /chat
 */
function ChatPage() {
  usePageTitle('Habit Coach');
  useRouteMonitoring('/chat');

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex h-[calc(100vh-10rem)] flex-1 flex-col sm:h-[calc(100vh-14rem)]"
    >
      <header className="mb-4 shrink-0">
        <h1 className="text-2xl font-semibold">Habit Coach</h1>
        <p className="text-muted-foreground text-sm">
          Ask anything about building better habits
        </p>
      </header>
      <Chat />
    </motion.section>
  );
}

export default ChatPage;
