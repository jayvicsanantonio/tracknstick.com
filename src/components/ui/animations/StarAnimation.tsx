import { motion, AnimatePresence } from "framer-motion";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { Star } = MiscellaneousIcons;

export default function StarAnimation({ isVisible }: { isVisible: boolean }) {
  return (
    <div aria-hidden="true">
      <AnimatePresence>
        {isVisible && (
          <>
            {[1, 2, 3, 4, 5].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  x: [0, (i - 2) * 40],
                  y: [0, (i % 2 === 0 ? -1 : 1) * 40],
                  rotate: [0, 360],
                }}
                exit={{
                  scale: 0,
                  x: (i - 2) * 40,
                  y: (i % 2 === 0 ? -1 : 1) * 40,
                }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="absolute z-10"
              >
                <Star
                  className="h-6 w-6 text-yellow-400 drop-shadow-lg"
                  fill="currentColor"
                />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
