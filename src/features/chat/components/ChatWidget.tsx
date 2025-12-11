import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatToggle } from './ChatToggle';
import { ChatBox } from './ChatBox';

/**
 * Floating chat widget that appears on all pages.
 * Fixed position at bottom-right corner.
 */
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <ChatBox onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      <ChatToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
    </div>
  );
}
