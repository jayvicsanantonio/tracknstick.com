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
      className="border-border/40 bg-background/50 shrink-0 border-t p-4"
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
          placeholder="Ask about habits and productivity..."
          rows={1}
          className="border-input bg-background placeholder:text-muted-foreground focus:ring-ring max-h-32 min-h-[44px] flex-1 resize-none rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
