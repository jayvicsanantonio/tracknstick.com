// The habit coach conversation: its messages, whether a reply is streaming, and the last error.
// Held by ChatWidget rather than the panel, so a reply keeps streaming while the panel is closed.

import { useCallback, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getConfig } from '@shared/utils/getConfig';
import type { Message } from '@features/chat/components/ChatMessage';

export interface ChatConversation {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  /** Forgets the messages and any error. */
  clear: () => void;
}

/**
 * Sends the conversation to the API and streams the coach's reply into the
 * last message. Uses a custom fetch-based implementation for streaming text
 * responses.
 */
export function useChatConversation(): ChatConversation {
  const { apiHost } = getConfig();
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);
      setIsLoading(true);

      // Add user message immediately
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Prepare messages for API (include history)
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // The coach's reply starts empty, which shows as a typing indicator
      // until the first words stream in. The catch removes exactly this
      // placeholder, rather than every empty message in the conversation.
      const assistantMessageId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ]);

      try {
        const token = await getToken();

        const response = await fetch(`${apiHost}/api/v1/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as {
            error?: { message?: string };
          };
          throw new Error(
            errorData.error?.message ?? `Request failed: ${response.status}`,
          );
        }

        // Read the streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let assistantContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;

          // Update the assistant message with accumulated content
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: assistantContent }
                : m,
            ),
          );
        }

        if (!assistantContent.trim()) {
          throw new Error("The coach didn't reply. Try again.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        // Drop the placeholder only if nothing streamed into it. Filtering on
        // empty content removed the user's own message too when it was empty.
        setMessages((prev) =>
          prev.filter(
            (m) => !(m.id === assistantMessageId && m.content === ''),
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiHost, getToken, isLoading, messages],
  );

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clear };
}
