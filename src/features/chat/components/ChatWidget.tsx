import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatToggle } from './ChatToggle';
import { ChatBox } from './ChatBox';

/**
 * Floating chat widget that appears on all pages.
 * Fixed position at bottom-right corner on desktop.
 * Full screen on mobile devices.
 */
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop: Fixed bottom-right position */}
      {/* Mobile: Full screen when open */}
      <div
        className={
          isOpen
            ? 'fixed inset-0 z-50 sm:inset-auto sm:bottom-6 sm:right-6'
            : 'fixed bottom-6 right-6 z-50'
        }
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full w-full sm:h-auto sm:w-auto"
            >
              <ChatBox onClose={() => setIsOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hide toggle button on mobile when chat is open */}
        {!isOpen && (
          <ChatToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        )}

        {/* Show toggle on desktop even when open */}
        <div className="hidden sm:block">
          {isOpen && (
            <div className="mt-4 flex justify-end">
              <ChatToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
