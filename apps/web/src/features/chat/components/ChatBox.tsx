// The habit coach's chat, the body of the Coach page: the conversation, suggestions and message box.
// Dismisses the mobile software keyboard cleanly when tapping or dragging the message log.

import { useRef, useEffect, useState, type ComponentType } from 'react';
import { Ban, CalendarCheck2, Sparkles, Sprout } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { triggerHaptic } from '@shared/utils/haptics';
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

export function ChatBox({ conversation }: ChatBoxProps) {
  const { messages, isLoading, error, sendMessage } = conversation;
  const logRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  // Auto-scroll to bottom when new messages arrive.
  useEffect(() => {
    const log = logRef.current;
    if (log && (messages.length > 0 || error)) log.scrollTop = log.scrollHeight;
  }, [messages, error]);

  // Ready to type as soon as the page opens on desktop; never auto-pop keyboard on touch.
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    textareaRef.current?.focus();
  }, []);

  const dismissMobileKeyboard = () => {
    if (
      window.matchMedia?.('(pointer: coarse)').matches &&
      document.activeElement === textareaRef.current
    ) {
      textareaRef.current?.blur();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    triggerHaptic('light');
    void sendMessage(input);
    setInput('');
    textareaRef.current?.focus();
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col text-(--color-card-foreground)">
      {/* Messages area */}
      <div
        ref={logRef}
        role="log"
        aria-label="Conversation"
        aria-busy={isLoading}
        onTouchMove={dismissMobileKeyboard}
        onClick={dismissMobileKeyboard}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-3 sm:px-6 sm:pt-0"
      >
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-3.5 pb-4 sm:gap-4">
          {messages.length === 0 && (
            <div className="my-auto flex flex-col items-center py-2 text-center sm:py-6">
              <div className="mb-4 flex size-13 items-center justify-center rounded-2xl bg-(--color-brand-primary)/12 ring-1 ring-(--color-brand-primary)/25 ring-inset sm:mb-5 sm:size-16">
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
                className="mt-6 grid w-full gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3"
              >
                {SUGGESTED_QUESTIONS.map(({ question, Icon }) => (
                  <li key={question}>
                    <SuggestionCard
                      text={question}
                      Icon={Icon}
                      onClick={() => {
                        triggerHaptic('light');
                        void sendMessage(question);
                        if (!window.matchMedia?.('(pointer: coarse)').matches) {
                          textareaRef.current?.focus();
                        }
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
              className="rounded-2xl bg-(--color-destructive)/10 px-4 py-3 text-sm text-(--color-destructive)"
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
      className="ios-grouped-card group flex h-full min-h-12 w-full items-center gap-3 rounded-2xl p-3.5 text-left text-[15px] font-medium text-(--color-foreground) transition-[background-color,transform] focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-[0.98] sm:flex-col sm:items-start sm:gap-4 sm:border-0 sm:bg-(--color-surface)/60 sm:p-4 sm:text-sm sm:shadow-none sm:ring-1 sm:ring-(--color-border-primary)/50 sm:ring-inset sm:hover:bg-(--color-brand-primary)/5 sm:hover:ring-(--color-brand-primary)/60 dark:sm:bg-(--color-surface-secondary)/60"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-(--color-brand-primary)/12 text-(--color-brand-primary)">
        <Icon aria-hidden={true} className="h-5 w-5" />
      </span>
      {text}
    </button>
  );
}
