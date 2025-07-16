import { SignIn } from "@clerk/clerk-react";
import { motion } from "framer-motion";

export default function Welcome() {
  return (
    <div className="flex-1">
      <div className="flex flex-col items-center justify-center min-h-[78vh] relative overflow-hidden px-2 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-800 dark:text-purple-200 mb-4 sm:mb-6">
            Welcome to Track N&apos; Stick
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-purple-600 dark:text-purple-300 mb-8 sm:mb-12 leading-relaxed">
            Embark on your journey to better habits and personal growth. Start
            by adding your first habit and watch your progress unfold.
          </p>
          <div className="flex flex-col items-center space-y-4 z-10">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-full font-semibold transition-colors duration-300 shadow-lg",
                },
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
