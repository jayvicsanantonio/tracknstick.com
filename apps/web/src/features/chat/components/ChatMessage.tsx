// One message in the chat panel: the user's on the right, the coach's on the left.
// A coach message with no text yet shows a smooth pulsing typing indicator, and
// completed coach replies render styled Markdown with a subtle one-tap Copy action.

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Copy, Sparkles } from 'lucide-react';
import Markdown, { type Components } from 'react-markdown';
import { cn } from '@shared/utils/utils';
import { triggerHaptic } from '@shared/utils/haptics';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessageProps {
  message: Message;
  /** True while this specific assistant message is still actively streaming. */
  isStreaming?: boolean;
}

const SAFE_URL_PROTOCOL = /^(https?:|mailto:)/i;

const MARKDOWN_COMPONENTS: Components = {
  p: ({ children }) => (
    <p className="m-0 text-[15px] leading-[1.55] sm:text-sm sm:leading-relaxed [&+&]:mt-2.5">
      {children}
    </p>
  ),
  h1: ({ children }) => (
    <h3 className="mt-3.5 mb-1.5 text-[16px] font-bold tracking-tight text-(--color-foreground) first:mt-0 sm:text-[15px]">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="mt-3.5 mb-1.5 text-[15px] font-bold tracking-tight text-(--color-foreground) first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-3 mb-1 text-[14px] font-semibold tracking-tight text-(--color-foreground) first:mt-0">
      {children}
    </h4>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.55] marker:text-(--color-brand-primary) sm:text-sm sm:leading-relaxed">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1.5 pl-5 text-[15px] leading-[1.55] marker:font-semibold marker:text-(--color-brand-primary) sm:text-sm sm:leading-relaxed">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-0.5 [&>p]:m-0">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-(--color-foreground)">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="text-(--color-foreground)/90 italic">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2.5 border-l-2 border-(--color-brand-primary)/60 pl-3 text-(--color-text-secondary) italic">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-xl bg-(--color-background)/70 p-3 font-mono text-[13px] leading-relaxed text-(--color-foreground)">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded-md bg-(--color-brand-primary)/12 px-1.5 py-0.5 font-mono text-[13px] text-(--color-brand-text) dark:text-(--color-brand-text-light)">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2.5 overflow-x-auto">{children}</pre>
  ),
  hr: () => <hr className="my-3 border-t border-(--color-border-primary)/50" />,
  a: ({ href, children }) => {
    const safeHref = href && SAFE_URL_PROTOCOL.test(href) ? href : undefined;
    return safeHref ? (
      <a
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-(--color-brand-primary) underline underline-offset-2"
      >
        {children}
      </a>
    ) : (
      <span>{children}</span>
    );
  },
};

/**
 * Individual chat message bubble component.
 * Displays user messages on the right and assistant messages on the left.
 * Assistant messages are rendered as styled Markdown with a copy action.
 */
export function ChatMessage({
  message,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isTyping = !isUser && message.content === '';
  const prefersReducedMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const handleCopy = async () => {
    if (!navigator.clipboard?.writeText) return;
    // Fire synchronously inside the click gesture before awaiting clipboard access.
    triggerHaptic('light');
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable in restricted contexts; ignore silently.
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex items-start gap-2.5',
        isUser
          ? 'ml-auto max-w-[85%] justify-end'
          : 'mr-auto max-w-full sm:max-w-[88%]',
      )}
    >
      {/* Top-aligned coach emblem beside the first line of advice on wider
          screens; phones label the reply above it and give it the full width */}
      {!isUser && (
        <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-(--color-brand-primary)/15 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/25 ring-inset max-sm:hidden">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
        </div>
      )}

      <div className="flex min-w-0 flex-col items-start">
        {!isUser && (
          <div className="mb-1.5 ml-1 flex items-center gap-1.5 text-[12px] font-semibold text-(--color-text-secondary) sm:hidden">
            <span
              aria-hidden="true"
              className="flex size-5 items-center justify-center rounded-full bg-(--color-brand-primary)/15 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/25 ring-inset"
            >
              <Sparkles className="size-3" />
            </span>
            Coach
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-[22px] px-4 py-2.5 select-text',
            isUser
              ? 'rounded-br-[6px] bg-(--color-brand-primary) text-(--color-primary-foreground) shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_2px_8px_rgba(0,0,0,0.12)]'
              : 'coach-bubble rounded-tl-[6px] py-3 text-(--color-foreground)',
          )}
        >
          {isTyping ? (
            <span
              role="status"
              aria-label="The coach is replying"
              className="flex h-6 items-center gap-1.5 px-0.5"
            >
              {[0, 180, 360].map((delay) => (
                <span
                  key={delay}
                  style={{ animationDelay: `${delay}ms` }}
                  className="coach-dot-pulse size-2 rounded-full bg-(--color-brand-primary)"
                />
              ))}
            </span>
          ) : isUser ? (
            <p className="text-[15px] leading-[1.45] whitespace-pre-wrap sm:text-sm sm:leading-relaxed">
              {message.content}
            </p>
          ) : (
            <div className="max-w-none space-y-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <Markdown components={MARKDOWN_COMPONENTS}>
                {message.content}
              </Markdown>
            </div>
          )}
        </div>

        {/* Subtle one-tap Copy action once the coach finishes replying */}
        {!isUser && !isTyping && !isStreaming ? (
          <button
            type="button"
            onClick={() => void handleCopy()}
            aria-label={copied ? 'Copied response' : 'Copy response'}
            className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-(--color-text-secondary)/75 transition-colors hover:bg-(--color-brand-primary)/10 hover:text-(--color-foreground) focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-95 max-sm:mt-0.5 max-sm:min-h-8 max-sm:gap-1.5 max-sm:px-2.5 max-sm:text-[12px] max-sm:text-(--color-text-secondary)"
          >
            {copied ? (
              <>
                <Check
                  aria-hidden="true"
                  className="size-3 text-(--color-brand-primary) max-sm:size-3.5"
                />
                <span className="text-(--color-brand-primary)">Copied</span>
              </>
            ) : (
              <>
                <Copy aria-hidden="true" className="size-3 max-sm:size-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
