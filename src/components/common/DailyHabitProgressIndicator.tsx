import { useContext, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "@/context/ThemeContext";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { Check } = MiscellaneousIcons;

export default function DailyHabitProgressIndicator({
  completionRate,
}: {
  completionRate: number;
}) {
  const { isDarkMode } = useContext(ThemeContext);
  const progressRef = useRef<SVGCircleElement>(null);
  const normalizedRate = Number.isNaN(completionRate) ? 0 : completionRate;

  useEffect(() => {
    if (progressRef.current) {
      const circumference = 46 * 2 * Math.PI;
      const offset = circumference * (1 - normalizedRate / 100);
      progressRef.current.style.strokeDashoffset = `${offset}`;
    }
  }, [normalizedRate]);

  return (
    <div className="flex flex-col items-center justify-center mb-12">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64">
        <div className="relative w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className={isDarkMode ? "text-gray-700" : "text-purple-200"}
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="46"
              cx="50"
              cy="50"
            />
            <circle
              ref={progressRef}
              className={`${isDarkMode ? "text-purple-400" : "text-purple-600"} transition-[stroke-dashoffset] duration-500 ease-out`}
              strokeWidth="8"
              strokeDasharray={`${46 * 2 * Math.PI}`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="46"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
              style={{
                strokeDashoffset: 46 * 2 * Math.PI,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {normalizedRate === 100 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Check
                  className={`w-36 h-36 ${
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                />
              </motion.div>
            ) : (
              <span
                className={`text-4xl font-bold ${
                  isDarkMode ? "text-purple-200" : "text-purple-800"
                }`}
              >
                {normalizedRate}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
