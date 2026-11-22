// The Coach page's message box: native iMessage / ChatGPT iOS frosted pill composer
// with a circular upward-arrow send button that grows cleanly with multiline input.

import { useLayoutEffect, type RefObject } from 'react';
import { Button } from '@shared/components/ui/button';
import { ArrowUp, Loader2 } from 'lucide-react';
import { cn } from '@shared/utils/utils';

interface ChatInputProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ChatInput({
  textareaRef,
  input,
  onInputChange,
  onSubmit,
  isLoading,
}: ChatInputProps) {
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const borders = textarea.offsetHeight - textarea.clientHeight;
    textarea.style.height = `${textarea.scrollHeight + borders}px`;
  }, [input, textareaRef]);

  const canSend = Boolean(input.trim()) && !isLoading;

  return (
    <form
      onSubmit={onSubmit}
      className="shrink-0 px-3 pt-1.5 pb-2.5 sm:px-6 sm:pt-2 sm:pb-6"
    >
      <div className="ios-liquid-glass mx-auto flex max-w-3xl items-end gap-2 rounded-[26px] p-1.5 pl-3.5 transition-shadow focus-within:ring-2 focus-within:ring-(--color-ring) sm:rounded-2xl sm:border-0 sm:bg-(--color-background) sm:pl-1.5 sm:shadow-sm sm:ring-1 sm:ring-(--color-border-primary)/60 sm:backdrop-blur-none sm:ring-inset">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
          aria-label="Ask the habit coach"
          placeholder="Ask the coach anything…"
          rows={1}
          className="max-h-36 min-h-[38px] flex-1 resize-none overflow-y-auto bg-transparent py-2 text-base leading-6 outline-none placeholder:text-(--color-text-secondary) sm:min-h-[44px] sm:px-3 sm:py-2.5 sm:text-sm"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
          disabled={!canSend}
          className={cn(
            'size-9 shrink-0 rounded-full transition-transform active:scale-90 sm:h-11 sm:w-11 sm:rounded-xl',
            !canSend && 'opacity-45',
          )}
        >
          {isLoading ? (
            <Loader2
              aria-hidden="true"
              className="size-4 animate-spin sm:size-5"
            />
          ) : (
            <ArrowUp aria-hidden="true" className="size-5" strokeWidth={2.5} />
          )}
        </Button>
      </div>
      <p className="mx-auto mt-2 hidden max-w-3xl text-center text-xs text-(--color-text-secondary) sm:block">
        Enter to send · Shift + Enter for a new line
      </p>
    </form>
  );
}
