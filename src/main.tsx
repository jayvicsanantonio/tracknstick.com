import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ThemeProvider from '@/context/ThemeProvider';
import DateProvider from '@/context/DateProvider.tsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { shadesOfPurple } from '@clerk/themes';
import { Toaster } from '@/components/ui/toaster.tsx';
import App from '@/App.tsx';
import '@/index.css';
import { registerSW } from 'virtual:pwa-register';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      void updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        appearance={{
          baseTheme: [shadesOfPurple],
          variables: { colorPrimary: 'var(--color-purple-50)' },
          signIn: {
            baseTheme: [shadesOfPurple],
            variables: {
              colorPrimary: 'var(--color-purple-50)',
            },
          },
        }}
      >
        <DateProvider>
          <App>
            <RouterProvider router={router} />
          </App>
          <Toaster />
        </DateProvider>
      </ClerkProvider>
    </ThemeProvider>
  </StrictMode>,
);
