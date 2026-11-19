import { X, Sparkles } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
}

/**
 * Header bar for the chat widget with title and close button.
 */
export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-(--color-border-primary)/40 bg-gradient-to-r from-(--color-brand-primary)/10 to-(--color-brand-primary)/5 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 sm:py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-brand-primary)/20">
          <Sparkles className="h-4 w-4 text-(--color-brand-primary)" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Habit Coach</h2>
          <p className="text-xs text-(--color-text-secondary) sm:text-[10px]">
            Powered by Atomic Habits (James Clear)
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="flex size-11 items-center justify-center rounded-full text-(--color-text-secondary) transition-colors hover:bg-(--color-muted) hover:text-(--color-foreground) sm:size-8"
        aria-label="Close chat"
      >
        <X className="h-5 w-5 sm:h-4 sm:w-4" />
      </button>
    </div>
  );
}
