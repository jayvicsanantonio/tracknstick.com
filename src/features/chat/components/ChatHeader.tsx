import { X, Sparkles } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
}

/**
 * Header bar for the chat widget with title and close button.
 */
export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <div className="border-border/40 from-primary/10 to-primary/5 flex shrink-0 items-center justify-between border-b bg-gradient-to-r px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-full">
          <Sparkles className="text-primary h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Habit Coach</h2>
          <p className="text-muted-foreground text-[10px]">
            Powered by Atomic Habits
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full p-1.5 transition-colors"
        aria-label="Close chat"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
