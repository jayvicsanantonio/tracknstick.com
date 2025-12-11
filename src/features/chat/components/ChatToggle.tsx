import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

interface ChatToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

/**
 * Circular button to toggle the chat widget open/closed.
 */
export function ChatToggle({ isOpen, onClick }: ChatToggleProps) {
  return (
    <motion.button
      onClick={onClick}
      className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </motion.div>
    </motion.button>
  );
}
