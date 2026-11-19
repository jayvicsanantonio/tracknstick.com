import { Button } from '@shared/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
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
  input,
  onInputChange,
  onSubmit,
  isLoading,
}: ChatInputProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="shrink-0 border-t border-(--color-border-primary)/40 bg-(--color-background)/50 p-4 pb-[max(env(safe-area-inset-bottom),1rem)] sm:pb-4"
    >
      <div className="flex items-end gap-2">
        <textarea
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
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-lg border border-(--color-input) bg-(--color-background) px-4 py-3 text-base placeholder:text-(--color-text-secondary) focus:ring-2 focus:ring-(--color-ring) focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="h-11 w-11 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </form>
  );
}
