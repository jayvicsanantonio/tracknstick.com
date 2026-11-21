// The Coach page's message box: one rounded field holding the text and the send button.
// The box grows with its text and stays usable while the coach replies; only sending waits.

import { useLayoutEffect, type RefObject } from 'react';
import { Button } from '@shared/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

/**
 * Chat input component with textarea and send button.
 * Supports Enter to send and Shift+Enter for new lines.
 */
export function ChatInput({
  textareaRef,
  input,
  onInputChange,
  onSubmit,
  isLoading,
}: ChatInputProps) {
  // Fit the box to its text; its max height caps the growth, then it scrolls.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const borders = textarea.offsetHeight - textarea.clientHeight;
    textarea.style.height = `${textarea.scrollHeight + borders}px`;
  }, [input, textareaRef]);

  return (
    <form
      onSubmit={onSubmit}
      className="shrink-0 px-3 pt-2 pb-3 sm:px-6 sm:pb-6"
    >
      {/* The field's frame shows focus for the text inside it. */}
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl bg-(--color-background) p-1.5 shadow-sm ring-1 ring-(--color-border-primary)/60 transition-shadow ring-inset focus-within:ring-2 focus-within:ring-(--color-ring)">
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
          className="max-h-40 min-h-[44px] flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2.5 text-base leading-6 outline-none placeholder:text-(--color-text-secondary) sm:text-sm"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
          disabled={isLoading || !input.trim()}
          className="h-11 w-11 shrink-0 rounded-xl"
        >
          {isLoading ? (
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
          ) : (
            <Send aria-hidden="true" className="h-5 w-5" />
          )}
        </Button>
      </div>
      <p className="mx-auto mt-2 hidden max-w-3xl text-center text-xs text-(--color-text-secondary) sm:block">
        Enter to send · Shift + Enter for a new line
      </p>
    </form>
  );
}
