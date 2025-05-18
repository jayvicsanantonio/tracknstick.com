import { useContext } from "react";

import { cn } from "@/lib/utils";
import { ThemeContext } from "@/context/ThemeContext";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full file:text-zinc-950 selection:text-zinc-50 dark:bg-zinc-200/30 flex h-9 min-w-0 rounded-md border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:file:text-zinc-50 dark:selection:bg-zinc-50 dark:selection:text-zinc-900 dark:dark:bg-zinc-800/30",
        "aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 dark:dark:aria-invalid:ring-red-900/40",
        `${
          isDarkMode
            ? "bg-gray-800 border-gray-600 focus:border-purple-400 text-white focus-visible:ring-purple-400 placeholder:text-gray-400"
            : "bg-white border-purple-200 focus:border-purple-500 focus-visible:ring-purple-300 placeholder:text-zinc-500"
        }`,
        className,
      )}
      {...props}
    />
  );
}

export { Input };
