// Holds the habit coach conversation above the routes, so it outlives a visit to another page.
// While the Coach page is not shown, clears the conversation 10 minutes after its last message.

import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useChatConversation } from '@features/chat/hooks/useChatConversation';
import { ChatConversationContext } from './ChatConversationContextDefinition';

/** How long the conversation is kept, away from the Coach page, after its last message. */
const CONVERSATION_LIFETIME_MS = 10 * 60 * 1000;

const COACH_PATH = '/coach';

export function ChatConversationProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Held in memory only: a reload or sign-out clears it. A reply keeps
  // streaming while another page is shown.
  const conversation = useChatConversation();
  const { messages, clear } = conversation;
  const isOnCoachPage = useLocation().pathname === COACH_PATH;
  const lastMessageAtRef = useRef(0);

  // Every new message and every streamed chunk counts as activity.
  useEffect(() => {
    if (messages.length > 0) lastMessageAtRef.current = Date.now();
  }, [messages]);

  // Away from the Coach page, clear the conversation once its last message
  // is CONVERSATION_LIFETIME_MS old. Never on the Coach page: it would
  // vanish from under the reader.
  useEffect(() => {
    if (isOnCoachPage || messages.length === 0) return;
    const remaining =
      lastMessageAtRef.current + CONVERSATION_LIFETIME_MS - Date.now();
    const timer = setTimeout(clear, Math.max(0, remaining));
    return () => clearTimeout(timer);
  }, [isOnCoachPage, messages, clear]);

  return (
    <ChatConversationContext.Provider value={conversation}>
      {children}
    </ChatConversationContext.Provider>
  );
}
