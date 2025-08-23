import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ThemeProvider from '@app/providers/ThemeProvider';
import DateProvider from '@app/providers/DateProvider.tsx';
import { OfflineProvider } from '@app/providers/OfflineProvider.tsx';
import '@/core/offline/database/DevUtils'; // Enable development utilities
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from '@shared/components/ui/toaster.tsx';
import App from '@app/App.tsx';
import '@/styles/index.css';
import { registerSW } from 'virtual:pwa-register';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/pages/routes';

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
          variables: {
            colorPrimary: 'var(--color-brand-primary)',
            colorText: 'var(--color-foreground)',
            colorBackground: 'var(--color-background)',
            borderRadius: '12px',
          },
          signIn: {
            variables: {
              colorPrimary: 'var(--color-brand-primary)',
              colorText: 'var(--color-foreground)',
              colorBackground: 'var(--color-background)',
            },
          },
        }}
      >
        <OfflineProvider>
          <DateProvider>
            <App>
              <RouterProvider router={router} />
            </App>
            <Toaster />
          </DateProvider>
        </OfflineProvider>
      </ClerkProvider>
    </ThemeProvider>
  </StrictMode>,
);
