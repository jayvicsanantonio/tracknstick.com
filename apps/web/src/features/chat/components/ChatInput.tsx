// The chat panel's message box and send button.
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
      className="shrink-0 border-t border-(--color-border-primary)/40 bg-(--color-background)/50 p-4 pb-[max(env(safe-area-inset-bottom),1rem)] sm:pb-4"
    >
      <div className="flex items-end gap-2">
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
          className="max-h-32 min-h-[44px] flex-1 resize-none overflow-y-auto rounded-xl border border-(--color-input) bg-(--color-background) px-4 py-2.5 text-base leading-6 placeholder:text-(--color-text-secondary) focus:ring-2 focus:ring-(--color-ring) focus:ring-offset-2 focus:outline-none sm:text-sm"
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
    </form>
  );
}
