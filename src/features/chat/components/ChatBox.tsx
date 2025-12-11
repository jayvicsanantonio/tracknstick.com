import { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BookOpen } from 'lucide-react';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { getConfig } from '@shared/utils/getConfig';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBoxProps {
  onClose: () => void;
}

/**
 * The chat panel that contains messages and input.
 * Uses a custom fetch-based implementation for streaming text responses.
 */
export function ChatBox({ onClose }: ChatBoxProps) {
  const { apiHost } = getConfig();
  const { getToken } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

        // Create assistant message placeholder
        const assistantMessageId = `assistant-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          { id: assistantMessageId, role: 'assistant', content: '' },
        ]);

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
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        // Remove the empty assistant message if error occurred
        setMessages((prev) => prev.filter((m) => m.content !== ''));
      } finally {
        setIsLoading(false);
      }
    },
    [apiHost, getToken, isLoading, messages],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    void sendMessage(input);
    setInput('');
  };

  return (
    <div className="border-border/50 bg-card flex h-full w-full flex-col overflow-hidden shadow-2xl backdrop-blur-2xl sm:h-[550px] sm:w-[400px] sm:rounded-2xl sm:border">
      <ChatHeader onClose={onClose} />

      {/* Messages area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <BookOpen className="text-primary h-7 w-7" />
            </div>
            <h2 className="text-base font-semibold">Habits Coach</h2>
            <p className="text-muted-foreground mt-2 max-w-[280px] text-xs">
              Get tips on building better habits, staying productive, and
              achieving your goals.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <SuggestionChip
                text="Build habits"
                onClick={() => setInput('How do I build a new habit?')}
              />
              <SuggestionChip
                text="Stay consistent"
                onClick={() =>
                  setInput('How can I stay consistent with my habits?')
                }
              />
              <SuggestionChip
                text="Break bad habits"
                onClick={() => setInput('How do I break a bad habit?')}
              />
            </div>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-xs">
            Error: {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}

/**
 * Suggestion chip component for quick prompts
 */
function SuggestionChip({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border/60 bg-background hover:border-primary hover:bg-primary/5 rounded-full border px-2.5 py-1 text-[10px] transition-colors"
    >
      {text}
    </button>
  );
}
