// The habit coach's chat panel, opened from the header's Coach button or the phone tab bar.
// The panel and its markdown renderer download the first time it opens, not with the page.
import { lazy, Suspense, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
 * Chat panel that appears on all pages.
 * Drops down under the header, at the toolbar's right edge, on wider screens.
 * Full screen on mobile devices.
 *
 * The parent owns the open state: the header's Coach button opens the panel,
 * and on phones the tab bar's Coach tab does.
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
      {/* Mobile: Full screen when open */}
      {/* Wider screens: just below the header's toolbar, which ends 5.5rem
          down. The three layers repeat the app shell's padding, its centred
          column and the header's own padding, so the panel's right edge lines
          up with the toolbar's. Clicks pass through everywhere but the panel
          itself. */}
      <div className="pointer-events-none fixed inset-0 z-50 sm:top-24 sm:bottom-auto sm:px-4 md:px-8">
        <div className="h-full sm:mx-auto sm:h-auto sm:max-w-7xl 2xl:max-w-[90rem]">
          <div className="h-full sm:flex sm:h-auto sm:justify-end sm:px-4 md:px-8">
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="pointer-events-auto h-full w-full sm:h-auto sm:w-auto sm:origin-top-right"
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
          </div>
        </div>
      </div>
    </>
  );
}
