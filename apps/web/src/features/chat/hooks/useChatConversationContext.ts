// Reads the habit coach conversation that ChatConversationProvider holds.
// Throws outside the provider, where there is no conversation to read.

import { useContext } from 'react';
import { ChatConversationContext } from '@features/chat/context/ChatConversationContextDefinition';

export function useChatConversationContext() {
  const context = useContext(ChatConversationContext);
  if (context === null) {
    throw new Error(
      'useChatConversationContext must be used within a ChatConversationProvider',
    );
  }
  return context;
}
