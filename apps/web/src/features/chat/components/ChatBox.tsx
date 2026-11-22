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
  ArrowUpRight,
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
}

export function ChatBox({ conversation, onScrollStateChange }: ChatBoxProps) {
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
    triggerHaptic('light');
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
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-1 sm:px-6 sm:pt-4"
      >
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-3.5 pb-6 sm:gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col sm:my-auto sm:items-center sm:py-6 sm:text-center">
              {/* Mobile Hero Card (matches Tracker's rounded-[26px] hero card rhythm);
                  clean centered welcome header on desktop. */}
              <div className="ios-tracker-card relative overflow-hidden rounded-[26px] p-5 sm:flex sm:flex-col sm:items-center sm:overflow-visible sm:rounded-none sm:p-0">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-12 -left-12 size-40 rounded-full bg-(--color-brand-primary)/18 blur-3xl sm:hidden"
                />

                <div className="relative flex items-start gap-3.5 sm:flex-col sm:items-center sm:gap-0">
                  <div className="relative mt-0.5 shrink-0 sm:mt-0 sm:mb-5">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-4 hidden rounded-full bg-(--color-brand-primary)/20 blur-2xl sm:block"
                    />
                    <div className="relative flex size-12 items-center justify-center rounded-[15px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset sm:size-16 sm:rounded-[22px] sm:bg-(--color-brand-primary)/15 sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_28px_color-mix(in_oklab,var(--color-brand-primary)_22%,transparent)] sm:ring-(--color-brand-primary)/30">
                      <Sparkles
                        aria-hidden="true"
                        className="size-6 sm:h-8 sm:w-8"
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 sm:flex-none">
                    <span className="mb-0.5 block text-[11px] font-semibold tracking-[0.06em] text-(--color-brand-primary) uppercase sm:hidden">
                      Atomic Habits
                    </span>
                    <h2 className="text-[19px] leading-tight font-bold tracking-[-0.02em] text-(--color-foreground) sm:text-2xl sm:font-semibold">
                      How can I help?
                    </h2>
                    <p className="mt-1 text-[14px] leading-snug text-(--color-text-secondary) sm:mt-2 sm:max-w-md sm:text-base sm:leading-relaxed">
                      Ask about starting, keeping or breaking a habit. Pick a
                      question to begin, or ask your own.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section header matching Tracker's TODAY'S HABITS & Habits' ALL HABITS */}
              <div className="mt-5 mb-2.5 flex items-center justify-between px-1 sm:hidden">
                <span className="text-[12px] font-semibold tracking-[0.06em] text-(--color-text-secondary)/85 uppercase">
                  Suggested Prompts
                </span>
                <span className="rounded-full bg-(--color-brand-primary)/12 px-2.5 py-0.5 text-[11px] font-semibold text-(--color-brand-primary) tabular-nums">
                  {SUGGESTED_QUESTIONS.length}
                </span>
              </div>

              <ul
                aria-label="Suggested questions"
                className="grid w-full gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3"
              >
                {SUGGESTED_QUESTIONS.map(({ question, Icon }) => (
                  <li key={question}>
                    <SuggestionCard
                      text={question}
                      Icon={Icon}
                      onClick={() => {
                        triggerHaptic('light');
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

      {/* Soft edge fade so messages dissolve cleanly behind the floating mobile composer */}
      <div
        aria-hidden="true"
        className="pointer-events-none -mt-5 h-5 shrink-0 bg-gradient-to-t from-(--color-background) to-transparent sm:hidden"
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
      className="ios-tracker-card group flex h-full min-h-[72px] w-full cursor-pointer items-center gap-3.5 rounded-[20px] px-3.5 py-3 text-left text-[15px] leading-snug font-semibold text-(--color-foreground) transition-[background-color,transform,box-shadow] focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-[0.985] sm:min-h-0 sm:flex-col sm:items-start sm:gap-3.5 sm:rounded-2xl sm:border-0 sm:bg-(--color-surface)/60 sm:p-4 sm:text-sm sm:font-medium sm:shadow-none sm:ring-1 sm:ring-(--color-border-primary)/50 sm:ring-inset sm:hover:bg-(--color-brand-primary)/6 sm:hover:ring-(--color-brand-primary)/50 dark:sm:bg-(--color-surface-secondary)/60"
    >
      <div className="flex shrink-0 items-center justify-between sm:w-full">
        <span className="flex size-12 items-center justify-center rounded-[15px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset sm:size-9 sm:rounded-xl">
          <Icon aria-hidden={true} className="size-6 sm:h-5 sm:w-5" />
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="hidden size-4 text-(--color-text-secondary)/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-(--color-brand-primary) sm:block"
        />
      </div>
      <span className="flex-1">{text}</span>
      <ArrowUpRight
        aria-hidden="true"
        className="size-4 shrink-0 text-(--color-brand-primary)/60 sm:hidden"
      />
    </button>
  );
}
