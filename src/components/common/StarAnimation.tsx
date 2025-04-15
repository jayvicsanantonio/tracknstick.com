import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { Star } = MiscellaneousIcons;

const StarAnimationComponent = ({ isVisible }: { isVisible: boolean }) => {
  const starPositions = [
    { x: -80, y: -40 },
    { x: -40, y: 40 },
    { x: 0, y: -60 },
    { x: 40, y: 40 },
    { x: 80, y: -40 },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {starPositions.map((position, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1.2, 0],
                x: position.x,
                y: position.y,
                rotate: [0, 360],
              }}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            >
              <Star
                className="h-6 w-6 text-yellow-400 drop-shadow-lg"
                fill="currentColor"
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(StarAnimationComponent);
