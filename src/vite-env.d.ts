/// <reference types="vite/client" />

// Add type declaration for the global Clerk object injected by ClerkJS
interface ClerkInstance {
  session?: {
    getToken: (options?: { template?: string }) => Promise<string | null>;
    // Add other session properties if needed
  };
  // Add other Clerk properties if needed
}

interface Window {
  Clerk?: ClerkInstance;
}
