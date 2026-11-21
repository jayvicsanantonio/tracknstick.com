// The habit coach's chat, the body of the Coach page: the conversation, suggestions and message box.
// The conversation itself, and sending, come from useChatConversation, held above the routes.

import { useRef, useEffect, useState, type ComponentType } from 'react';
import { Ban, CalendarCheck2, Sparkles, Sprout } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatConversation } from '@features/chat/hooks/useChatConversation';

const SUGGESTED_QUESTIONS: {
  question: string;
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}[] = [
  { question: 'How do I build a new habit?', Icon: Sprout },
  {
    question: 'How can I stay consistent with my habits?',
    Icon: CalendarCheck2,
  },
  { question: 'How do I break a bad habit?', Icon: Ban },
];

interface ChatBoxProps {
  /** The conversation, kept above the routes so it outlives the page. */
  conversation: ChatConversation;
}

/**
 * The chat that contains messages and input. Fills the rest of its card.
 */
export function ChatBox({ conversation }: ChatBoxProps) {
  const { messages, isLoading, error, sendMessage } = conversation;
  const logRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  // Auto-scroll to bottom when new messages arrive. Scrolls the conversation
  // only, never the page around it, and leaves the welcome at its top.
  useEffect(() => {
    const log = logRef.current;
    if (log && (messages.length > 0 || error)) log.scrollTop = log.scrollHeight;
  }, [messages, error]);

  // Ready to type as soon as the page opens. Not on touch screens, where
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
    <div className="flex min-h-0 w-full flex-1 flex-col text-(--color-card-foreground)">
      {/* Messages area */}
      {/* A live log: screen readers announce each reply once it has
          finished streaming, not word by word. */}
      <div
        ref={logRef}
        role="log"
        aria-label="Conversation"
        aria-busy={isLoading}
        className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-6"
      >
        {/* A readable column, centred on wide screens */}
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 pb-4">
          {messages.length === 0 && (
            <div className="my-auto flex flex-col items-center py-2 text-center sm:py-6">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-(--color-brand-primary)/10 ring-1 ring-(--color-brand-primary)/20 ring-inset sm:mb-5 sm:size-16">
                <Sparkles
                  aria-hidden="true"
                  className="h-6 w-6 text-(--color-brand-primary) sm:h-8 sm:w-8"
                />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-(--color-foreground) sm:text-2xl">
                How can I help?
              </h2>
              <p className="mt-2 max-w-md text-sm text-(--color-text-secondary) sm:text-base">
                Ask about starting, keeping or breaking a habit. Pick a question
                to begin, or ask your own.
              </p>
              <ul
                aria-label="Suggested questions"
                className="mt-6 grid w-full gap-2 sm:mt-8 sm:grid-cols-3 sm:gap-3"
              >
                {SUGGESTED_QUESTIONS.map(({ question, Icon }) => (
                  <li key={question}>
                    <SuggestionCard
                      text={question}
                      Icon={Icon}
                      onClick={() => {
                        void sendMessage(question);
                        // The suggestions go away; the next message starts here.
                        textareaRef.current?.focus();
                      }}
                    />
                  </li>
                ))}
              </ul>
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
        </div>
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
function SuggestionCard({
  text,
  Icon,
  onClick,
}: {
  text: string;
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full min-h-11 w-full items-center gap-3 rounded-2xl bg-(--color-surface)/60 p-3 text-left text-sm font-medium text-(--color-foreground) ring-1 ring-(--color-border-primary)/50 transition-colors ring-inset hover:bg-(--color-brand-primary)/5 hover:ring-(--color-brand-primary)/60 focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none sm:flex-col sm:items-start sm:gap-4 sm:p-4 dark:bg-(--color-surface-secondary)/60"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-(--color-brand-primary)/12 text-(--color-brand-primary)">
        <Icon aria-hidden={true} className="h-5 w-5" />
      </span>
      {text}
    </button>
  );
}
