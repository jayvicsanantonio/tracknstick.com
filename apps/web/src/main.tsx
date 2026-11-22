import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ThemeProvider from '@app/providers/ThemeProvider';
import DateProvider from '@app/providers/DateProvider.tsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from '@shared/components/ui/toaster.tsx';
import App from '@app/App.tsx';
// Self-hosted, so the Content-Security-Policy needs no third-party font host.
import '@fontsource-variable/plus-jakarta-sans';
import '@/styles/index.css';
import { registerSW } from 'virtual:pwa-register';
import { RouterProvider } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { router } from '@app/routes';
import { createPersistentCache } from '@shared/services/swrCache';
import { applyUpdateWhenHidden } from '@shared/services/serviceWorkerUpdates';
import { watchKeyboard } from '@shared/services/keyboard';

// Register service worker. A new version waits until the app is out of
// sight, then reloads unseen, as a native app updates between uses.
const updateSW = registerSW({
  onNeedRefresh() {
    applyUpdateWhenHidden(() => void updateSW(true));
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

// The layout fits itself above the on-screen keyboard; see keyboard.ts.
watchKeyboard();

// One saved cache for the app's life. Made here rather than inside
// SWRConfig, whose provider React may call twice: the spare would still save
// itself, empty, over the real one when the page hides.
const swrCache = createPersistentCache();

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
        {/* The data cache is saved between launches, so the app opens to
            what it showed last time while it asks the API for fresh data. */}
        <SWRConfig value={{ provider: () => swrCache }}>
          <DateProvider>
            <App>
              <RouterProvider router={router} />
            </App>
            <Toaster />
          </DateProvider>
        </SWRConfig>
      </ClerkProvider>
    </ThemeProvider>
  </StrictMode>,
);
