// The context that carries the habit coach conversation from RootLayout to the Coach page.
// Kept apart from its provider so that file exports only a component.

import { createContext } from 'react';
import type { ChatConversation } from '@features/chat/hooks/useChatConversation';

export const ChatConversationContext = createContext<ChatConversation | null>(
  null,
);
