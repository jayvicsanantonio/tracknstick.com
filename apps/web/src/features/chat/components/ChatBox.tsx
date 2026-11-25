// The habit coach's chat, the body of the Coach page: the conversation, suggestions and message box.
// Dismisses the mobile software keyboard cleanly when tapping or dragging the message log,
// sticks to the latest streamed words without fighting manual scroll-up, and surfaces a
// floating jump-to-latest pill whenever the user scrolls back through advice.

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type ComponentType,
} from 'react';
import {
  AlertCircle,
  ArrowUp,
  Ban,
  CalendarCheck2,
  ChevronDown,
  Sparkles,
  Sprout,
} from 'lucide-react';
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

/** Leads the suggestions for a user with no habits, in place of the first. */
const FIRST_HABIT_QUESTION = {
  question: 'Help me pick my first habit',
  Icon: Sprout,
};

const PIN_THRESHOLD_PX = 80;
const JUMP_BUTTON_THRESHOLD_PX = 120;
const NAV_COLLAPSE_SCROLL_PX = 48;
const NAV_COLLAPSE_MIN_OVERFLOW_PX = 72;
const NAV_EXPAND_SCROLL_PX = 4;

interface ChatBoxProps {
  /** The conversation, kept above the routes so it outlives the page. */
  conversation: ChatConversation;
  /** Reports whether the internal chat log has scrolled past the top so the mobile nav bar can collapse. */
  onScrollStateChange?: (scrolled: boolean) => void;
  /** The user has no habits yet: the first suggestion helps choose one. */
  hasNoHabits?: boolean;
}

export function ChatBox({
  conversation,
  onScrollStateChange,
  hasNoHabits = false,
}: ChatBoxProps) {
  const { messages, isLoading, error, sendMessage } = conversation;
  const logRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pinnedToBottomRef = useRef(true);
  const navCollapsedRef = useRef(false);
  const prevMessageCountRef = useRef(messages.length);
  const [input, setInput] = useState('');
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const syncNavCollapsed = useCallback(
    (log: HTMLDivElement) => {
      if (!onScrollStateChange) return;
      const maxScroll = log.scrollHeight - log.clientHeight;
      if (
        !navCollapsedRef.current &&
        log.scrollTop > NAV_COLLAPSE_SCROLL_PX &&
        maxScroll > NAV_COLLAPSE_MIN_OVERFLOW_PX
      ) {
        navCollapsedRef.current = true;
        onScrollStateChange(true);
      } else if (
        navCollapsedRef.current &&
        log.scrollTop <= NAV_EXPAND_SCROLL_PX
      ) {
        navCollapsedRef.current = false;
        onScrollStateChange(false);
      }
    },
    [onScrollStateChange],
  );

  const handleLogScroll = useCallback(() => {
    const log = logRef.current;
    if (!log) return;
    const distanceFromBottom =
      log.scrollHeight - log.scrollTop - log.clientHeight;
    pinnedToBottomRef.current = distanceFromBottom < PIN_THRESHOLD_PX;
    setShowScrollToBottom(distanceFromBottom > JUMP_BUTTON_THRESHOLD_PX);
    syncNavCollapsed(log);
  }, [syncNavCollapsed]);

  const scrollToLatest = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const log = logRef.current;
    if (!log) return;
    pinnedToBottomRef.current = true;
    setShowScrollToBottom(false);
    if (typeof log.scrollTo === 'function') {
      log.scrollTo({ top: log.scrollHeight, behavior });
    } else {
      log.scrollTop = log.scrollHeight;
    }
  }, []);

  // Auto-scroll when a new message is added, an error appears, or new tokens
  // stream in while the reader is already near the bottom.
  useEffect(() => {
    const log = logRef.current;
    const messageAdded = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (messages.length === 0) {
      pinnedToBottomRef.current = true;
      if (navCollapsedRef.current) {
        navCollapsedRef.current = false;
        onScrollStateChange?.(false);
      }
      return;
    }

    if (!log) return;
    if (messageAdded || error || pinnedToBottomRef.current) {
      pinnedToBottomRef.current = true;
      log.scrollTop = log.scrollHeight;
      syncNavCollapsed(log);
    }
  }, [messages, error, onScrollStateChange, syncNavCollapsed]);

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
    triggerHaptic('medium');
    pinnedToBottomRef.current = true;
    void sendMessage(input);
    setInput('');
    textareaRef.current?.focus();
  };

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col text-(--color-card-foreground)">
      {/* Messages area */}
      <div
        ref={logRef}
        role="log"
        aria-label="Conversation"
        aria-busy={isLoading}
        onScroll={handleLogScroll}
        onTouchMove={dismissMobileKeyboard}
        onClick={dismissMobileKeyboard}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-1 sm:-mx-4 sm:px-4 sm:pt-0"
      >
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-3.5 pb-6 sm:gap-4">
          {messages.length === 0 && (
            // Phones seat the welcome and suggestions just above the message
            // box, within thumb reach; wider screens start them at the top.
            <div className="flex flex-col max-sm:mt-auto">
              {/* Open welcome on phones; an elevated hero card on wider screens */}
              <div className="ios-tracker-card-sm relative overflow-hidden px-1 sm:rounded-[26px] sm:p-7">
                <div className="relative min-w-0">
                  <div className="mb-1.5 flex items-center gap-1.5 max-sm:mb-2.5 max-sm:gap-2">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-(--color-brand-primary) max-sm:hidden"
                    />
                    <span
                      aria-hidden="true"
                      className="flex size-7 items-center justify-center rounded-full bg-(--color-brand-primary)/15 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/25 ring-inset sm:hidden"
                    >
                      <Sparkles className="size-3.5" />
                    </span>
                    <span className="text-[11px] leading-none font-semibold tracking-[0.09em] text-(--color-brand-primary) uppercase">
                      Atomic Habits
                    </span>
                  </div>
                  <h2 className="text-[19px] leading-tight font-bold tracking-[-0.02em] text-(--color-foreground) sm:text-2xl">
                    How can I help?
                  </h2>
                  <p className="mt-1 text-[14px] leading-snug text-(--color-text-secondary) sm:mt-1.5 sm:max-w-xl sm:text-[15px] sm:leading-relaxed">
                    Ask about starting, keeping or breaking a habit. Pick a
                    question to begin, or ask your own.
                  </p>
                </div>
              </div>

              {/* Section header matching Tracker's TODAY'S HABITS & Habits' ALL HABITS */}
              <div className="mt-5 mb-2.5 flex items-center px-1 sm:mt-6 sm:mb-3">
                <div className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-(--color-brand-primary)"
                  />
                  <span className="text-[11px] leading-none font-semibold tracking-[0.09em] text-(--color-brand-primary) uppercase">
                    Suggested Prompts
                  </span>
                </div>
              </div>

              <ul
                aria-label="Suggested questions"
                className="grid w-full gap-2.5 sm:gap-3 md:grid-cols-3"
              >
                {(hasNoHabits
                  ? [FIRST_HABIT_QUESTION, ...SUGGESTED_QUESTIONS.slice(1)]
                  : SUGGESTED_QUESTIONS
                ).map(({ question, Icon }) => (
                  <li key={question}>
                    <SuggestionCard
                      text={question}
                      Icon={Icon}
                      onClick={() => {
                        triggerHaptic('medium');
                        pinnedToBottomRef.current = true;
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

          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={
                isLoading &&
                message.role === 'assistant' &&
                index === messages.length - 1
              }
            />
          ))}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl border border-(--color-destructive)/30 bg-(--color-destructive)/12 px-4 py-3 text-sm text-(--color-destructive) dark:text-red-300"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating jump-to-latest pill when the reader scrolls up in a long reply */}
      {showScrollToBottom && messages.length > 0 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[4.75rem] z-10 flex justify-center sm:bottom-[6.5rem]">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              scrollToLatest('smooth');
            }}
            aria-label="Scroll to latest message"
            className="ios-liquid-glass pointer-events-auto flex size-9 items-center justify-center rounded-full text-(--color-foreground) transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-92"
          >
            <ChevronDown aria-hidden="true" className="size-4" />
          </button>
        </div>
      ) : null}

      {/* Soft edge fade so messages dissolve cleanly behind the floating pill composer */}
      <div
        aria-hidden="true"
        className="pointer-events-none -mt-5 h-5 shrink-0 bg-gradient-to-t from-(--color-background) to-transparent"
      />

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
      className="ios-tracker-card group flex h-full min-h-14 w-full cursor-pointer items-center gap-3 rounded-[18px] px-3 py-2.5 text-left text-[15px] leading-snug font-semibold text-(--color-foreground) transition-[background-color,border-color,transform] hover:border-(--color-brand-primary)/35 focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-[0.985] md:min-h-0 md:flex-col md:items-start md:gap-4 md:rounded-[20px] md:p-4"
    >
      <div className="flex shrink-0 items-center justify-between md:w-full">
        <span className="flex size-9 items-center justify-center rounded-[11px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset md:size-11 md:rounded-[14px]">
          <Icon aria-hidden={true} className="size-[18px] md:size-5" />
        </span>
        <ArrowUp
          aria-hidden="true"
          className="hidden size-4 text-(--color-brand-primary)/60 transition-transform group-hover:-translate-y-0.5 group-hover:text-(--color-brand-primary) md:block"
        />
      </div>
      <span className="flex-1">{text}</span>
      {/* Picking a suggestion sends it, like the message box's send arrow */}
      <ArrowUp
        aria-hidden="true"
        className="size-4 shrink-0 text-(--color-brand-primary)/60 transition-transform group-hover:-translate-y-0.5 group-hover:text-(--color-brand-primary) md:hidden"
      />
    </button>
  );
}
