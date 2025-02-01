import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ThemeProvider from "@/context/ThemeProvider";
import DateProvider from "@/context/DateProvider.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster.tsx";
import App from "./App.tsx";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <DateProvider>
          <App />
          <Toaster />
        </DateProvider>
      </ClerkProvider>
    </ThemeProvider>
  </StrictMode>
);
