// One message in the chat panel: the user's on the right, the coach's on the left.
// A coach message with no text yet shows a typing indicator.

import { cn } from '@shared/utils/utils';
import { Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

/**
 * Individual chat message bubble component.
 * Displays user messages on the right and assistant messages on the left.
 * Assistant messages are rendered as Markdown.
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isTyping = !isUser && message.content === '';

  return (
    <div
      className={cn(
        'flex items-end gap-2',
        isUser ? 'ml-auto max-w-[85%] justify-end' : 'mr-auto max-w-[92%]',
      )}
    >
      {/* The coach's avatar; the user's side needs none */}
      {!isUser && (
        <div className="mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-(--color-brand-primary)/15 text-(--color-brand-primary)">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'rounded-[20px] px-4 py-2.5 select-text',
          isUser
            ? 'rounded-br-[6px] bg-(--color-brand-primary) text-(--color-primary-foreground)'
            : 'rounded-bl-[6px] bg-(--color-muted)/85 text-(--color-foreground)',
        )}
      >
        {isTyping ? (
          <span
            role="status"
            aria-label="The coach is replying"
            className="flex h-6 items-center gap-1"
          >
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                style={{ animationDelay: `${delay}ms` }}
                className="size-1.5 animate-bounce rounded-full bg-(--color-text-secondary)"
              />
            ))}
          </span>
        ) : isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&>ol]:my-2 [&>p]:m-0 [&>p+p]:mt-2 [&>ul]:my-2">
            <Markdown>{message.content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
