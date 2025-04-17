/// <reference types="vite/client" />

interface ClerkInstance {
  session?: {
    getToken: (options?: { template?: string }) => Promise<string | null>;
  };
}

interface Window {
  Clerk?: ClerkInstance;
}
