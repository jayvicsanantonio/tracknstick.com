export default function Footer({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <footer
      className={`mt-auto py-6 ${isDarkMode ? "bg-gray-900" : "bg-purple-100"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <p
          className={`text-sm text-center ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          © {new Date().getFullYear()} HabitHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
