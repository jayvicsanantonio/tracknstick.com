// The floating chat button, and the chat panel it opens.
// The panel and its markdown renderer download the first time it opens, not with the page.
import { lazy, Suspense, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatToggle } from './ChatToggle';
import { useChatConversation } from '@features/chat/hooks/useChatConversation';

/** How long a closed panel keeps the conversation after its last message. */
const CONVERSATION_LIFETIME_MS = 10 * 60 * 1000;

const ChatBox = lazy(() =>
  import('./ChatBox').then((module) => ({ default: module.ChatBox })),
);

interface ChatWidgetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

/**
 * Floating chat widget that appears on all pages.
 * Fixed position at bottom-right corner on desktop.
 * Full screen on mobile devices.
 *
 * The parent owns the open state: on phones the floating button is hidden
 * and the tab bar's Coach tab opens the panel instead.
 */
export function ChatWidget({ isOpen, onOpenChange }: ChatWidgetProps) {
  const setIsOpen = onOpenChange;

  // The conversation lives here, not in the panel, so closing the panel
  // keeps it, and a reply keeps streaming. Held in memory only: a reload or
  // sign-out clears it.
  const conversation = useChatConversation();
  const { messages, clear } = conversation;
  const lastMessageAtRef = useRef(0);

  // Every new message and every streamed chunk counts as activity.
  useEffect(() => {
    if (messages.length > 0) lastMessageAtRef.current = Date.now();
  }, [messages]);

  // While the panel is closed, clear the conversation once its last message
  // is CONVERSATION_LIFETIME_MS old. Never while open: it would vanish from
  // under the reader.
  useEffect(() => {
    if (isOpen || messages.length === 0) return;
    const remaining =
      lastMessageAtRef.current + CONVERSATION_LIFETIME_MS - Date.now();
    const timer = setTimeout(clear, Math.max(0, remaining));
    return () => clearTimeout(timer);
  }, [isOpen, messages, clear]);

  return (
    <>
      {/* Desktop: Fixed bottom-right position */}
      {/* Mobile: Full screen when open */}
      <div
        className={
          isOpen
            ? 'fixed inset-0 z-50 sm:inset-auto sm:right-6 sm:bottom-6'
            : 'fixed right-6 bottom-6 z-50 hidden sm:block'
        }
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full w-full sm:h-auto sm:w-auto"
            >
              <Suspense fallback={null}>
                <ChatBox
                  conversation={conversation}
                  onClose={() => setIsOpen(false)}
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>

        {/* While open, the panel's header holds the only close button */}
        {!isOpen && (
          <ChatToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        )}
      </div>
    </>
  );
}
