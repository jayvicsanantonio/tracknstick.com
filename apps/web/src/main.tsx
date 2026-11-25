import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ThemeProvider from '@app/providers/ThemeProvider';
import DateProvider from '@app/providers/DateProvider.tsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from '@shared/components/ui/toaster.tsx';
import { toast } from '@shared/hooks/use-toast';
import { ToastAction } from '@shared/components/ui/toast';
import App from '@app/App.tsx';
// Self-hosted, so the Content-Security-Policy needs no third-party font host.
import '@fontsource-variable/plus-jakarta-sans';
import '@/styles/index.css';
import { registerSW } from 'virtual:pwa-register';
import { RouterProvider } from 'react-router-dom';
import { router } from '@app/routes';
import { preloadAllPrimaryChunksWhenIdle } from '@shared/utils/preloadRoutes';
import { triggerHaptic } from '@shared/utils/haptics';

// Register service worker with an in-app toast instead of a browser confirm() dialog.
const updateSW = registerSW({
  onNeedRefresh() {
    toast({
      title: 'Update available',
      description: 'Reload to get the latest version.',
      duration: 15000,
      action: (
        <ToastAction
          altText="Reload to update"
          onClick={() => {
            triggerHaptic('medium');
            void updateSW(true);
          }}
        >
          Reload
        </ToastAction>
      ),
    });
  },
  onOfflineReady() {
    // Ready to work offline silently.
  },
});

preloadAllPrimaryChunksWhenIdle();

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
