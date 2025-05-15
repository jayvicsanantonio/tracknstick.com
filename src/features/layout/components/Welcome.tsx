import { SignIn } from "@clerk/clerk-react";
import { useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "@/context/ThemeContext";

export default function Welcome() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className="flex-1">
      <div className="flex flex-col items-center justify-center min-h-[78vh] relative overflow-hidden px-2 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl font-bold ${
              isDarkMode ? "text-purple-200" : "text-purple-800"
            } mb-4 sm:mb-6`}
          >
            Welcome to Track N&apos; Stick
          </h2>
          <p
            className={`text-base sm:text-lg md:text-xl ${
              isDarkMode ? "text-purple-300" : "text-purple-600"
            } mb-8 sm:mb-12 leading-relaxed`}
          >
            Embark on your journey to better habits and personal growth. Start
            by adding your first habit and watch your progress unfold.
          </p>
          <div className="flex flex-col items-center space-y-4 z-10">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: `${
                    isDarkMode
                      ? "bg-purple-700 hover:bg-purple-600"
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white rounded-full font-semibold transition-colors duration-300 shadow-lg`,
                },
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
