import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export default function Footer() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <footer
      className={`mt-auto py-10 ${
        isDarkMode ? "bg-gray-900" : "bg-purple-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <p
          className={`text-sm text-center ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          © {new Date().getFullYear()} Track N&apos; Stick. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
