import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export default function Footer() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <footer
      className={`mt-auto py-4 sm:py-6 md:py-10 border-t transition-colors duration-300 ${
        isDarkMode
          ? "border-gray-800 text-gray-400"
          : "border-purple-100 text-gray-600"
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className={`text-xs sm:text-sm mb-2 sm:mb-0`}>
            © {new Date().getFullYear()} Track N&apos; Stick. All rights
            reserved.
          </p>

          <div className="flex items-center space-x-4">
            <a
              href="#"
              className={`text-xs sm:text-sm transition hover:opacity-80 ${
                isDarkMode
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-purple-600 hover:text-purple-700"
              }`}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className={`text-xs sm:text-sm transition hover:opacity-80 ${
                isDarkMode
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-purple-600 hover:text-purple-700"
              }`}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
