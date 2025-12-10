import { useRef, useEffect, useState } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useAuth } from '@clerk/clerk-react';
import { BookOpen } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { getConfig } from '@shared/utils/getConfig';

/**
 * Main chat component that manages conversation state using AI SDK's useChat hook.
 * Connects to the backend chat API with Clerk authentication.
 */
export function Chat() {
  const { apiHost } = getConfig();
  const { getToken } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: `${apiHost}/api/v1/chat`,
      headers: async () => {
        const token = await getToken();
        return {
          Authorization: `Bearer ${token}`,
        };
      },
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    void sendMessage({ text: input });
    setInput('');
  };

  // Helper to get message content from parts
  const getMessageContent = (message: UIMessage): string => {
    if (!message.parts) return '';
    return message.parts
      .filter(
        (part: { type: string }): part is { type: 'text'; text: string } =>
          part.type === 'text',
      )
      .map((part: { type: 'text'; text: string }) => part.text)
      .join('');
  };

  return (
    <div className="border-border/40 bg-card flex flex-1 flex-col overflow-hidden rounded-lg border">
      {/* Messages area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <BookOpen className="text-primary h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold">Your Atomic Habits Coach</h2>
            <p className="text-muted-foreground mt-2 max-w-md text-sm">
              Ask about habit formation, the Four Laws of Behavior Change, habit
              stacking, or any concept from Atomic Habits!
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <SuggestionChip
                text="What are the Four Laws?"
                onClick={() =>
                  setInput('What are the Four Laws of Behavior Change?')
                }
              />
              <SuggestionChip
                text="How to break bad habits?"
                onClick={() => setInput('How do I break a bad habit?')}
              />
              <SuggestionChip
                text="Explain habit stacking"
                onClick={() =>
                  setInput('What is habit stacking and how do I use it?')
                }
              />
            </div>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={{
              id: message.id,
              role: message.role as 'user' | 'assistant',
              content: getMessageContent(message),
            }}
          />
        ))}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
            Error: {error.message}
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
      className="border-border/60 bg-background hover:border-primary hover:bg-primary/5 rounded-full border px-3 py-1.5 text-xs transition-colors"
    >
      {text}
    </button>
  );
}
