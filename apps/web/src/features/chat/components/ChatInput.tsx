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
      className="shrink-0 px-4 pt-1.5 pb-2 sm:px-0 sm:pt-2 sm:pb-2"
    >
      <div className="ios-tracker-card mx-auto flex max-w-3xl items-end gap-2 rounded-[26px] py-1.5 pr-1.5 pl-4 transition-shadow focus-within:ring-2 focus-within:ring-(--color-ring) sm:py-2 sm:pr-2 sm:pl-5">
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
          className="max-h-36 min-h-[38px] flex-1 resize-none overflow-y-auto bg-transparent py-2 text-[16px] leading-6 text-(--color-foreground) outline-none placeholder:text-(--color-text-secondary)/75 sm:min-h-[40px] sm:py-2 sm:text-[15px]"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
          disabled={!canSend}
          className={cn(
            'size-9 shrink-0 rounded-full transition-[transform,background-color,color,box-shadow] duration-150 active:scale-90 sm:size-10',
            canSend
              ? 'bg-(--color-brand-primary) text-(--color-primary-foreground) shadow-[0_2px_8px_rgba(0,0,0,0.14)] hover:bg-(--color-brand-secondary)'
              : 'bg-(--color-brand-primary)/14 text-(--color-brand-primary)/50 shadow-none disabled:opacity-100',
          )}
        >
          {isLoading ? (
            <Loader2
              aria-hidden="true"
              className="size-4 animate-spin text-(--color-brand-primary) sm:size-5"
            />
          ) : (
            <ArrowUp aria-hidden="true" className="size-5" strokeWidth={2.5} />
          )}
        </Button>
      </div>
      <p className="mx-auto mt-2 hidden max-w-3xl text-center text-xs text-(--color-text-secondary)/70 sm:block">
        Enter to send · Shift + Enter for a new line
      </p>
    </form>
  );
}
