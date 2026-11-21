// The habit coach's chat panel: the conversation, suggested questions and the message box.
// The conversation itself, and sending, come from useChatConversation, held by ChatWidget.

import { useRef, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatConversation } from '@features/chat/hooks/useChatConversation';

const SUGGESTED_QUESTIONS = [
  'How do I build a new habit?',
  'How can I stay consistent with my habits?',
  'How do I break a bad habit?',
];

interface ChatBoxProps {
  /** The conversation, kept by ChatWidget so it outlives the panel. */
  conversation: ChatConversation;
  onClose: () => void;
}

/**
 * The chat panel that contains messages and input.
 */
export function ChatBox({ conversation, onClose }: ChatBoxProps) {
  const { messages, isLoading, error, sendMessage } = conversation;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Ready to type as soon as the panel opens. Not on touch screens, where
  // focusing would raise the keyboard over the suggested questions.
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    void sendMessage(input);
    setInput('');
    // Pressing the send button moves focus to it; the next message starts here.
    textareaRef.current?.focus();
  };

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      className="flex h-full w-full flex-col overflow-hidden border-(--color-border-primary)/50 bg-(--color-card) text-(--color-card-foreground) shadow-2xl sm:h-[550px] sm:max-h-[calc(100dvh-7.5rem)] sm:w-[400px] sm:rounded-2xl sm:border"
    >
      <ChatHeader onClose={onClose} />

      {/* Messages area */}
      {/* A live log: screen readers announce each reply once it has
          finished streaming, not word by word. */}
      <div
        role="log"
        aria-label="Conversation"
        aria-busy={isLoading}
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-(--color-brand-primary)/10">
              <Sparkles
                aria-hidden="true"
                className="h-6 w-6 text-(--color-brand-primary)"
              />
            </div>
            <h3 className="text-base font-semibold">How can I help?</h3>
            <p className="mt-1 text-sm text-(--color-text-secondary)">
              Pick a question to start, or ask your own.
            </p>
            <div className="mt-5 flex w-full flex-col gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <SuggestionChip
                  key={question}
                  text={question}
                  onClick={() => {
                    void sendMessage(question);
                    // The suggestions go away; the next message starts here.
                    textareaRef.current?.focus();
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {error && (
          <div
            role="alert"
            className="rounded-xl bg-(--color-destructive)/10 px-4 py-3 text-sm text-(--color-destructive)"
          >
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput
        textareaRef={textareaRef}
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}

/**
 * A suggested question; picking it sends it.
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
      className="min-h-11 w-full rounded-xl border border-(--color-border-primary)/60 bg-(--color-background) px-4 py-2.5 text-left text-sm transition-colors hover:border-(--color-brand-primary) hover:bg-(--color-brand-primary)/5"
    >
      {text}
    </button>
  );
}
