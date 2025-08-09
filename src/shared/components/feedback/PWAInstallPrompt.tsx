import { useState, useEffect, useCallback, memo } from 'react';
import { Button } from '@shared/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = memo(function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();

      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show the install button
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    void deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setIsVisible(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="border-(--color-border-primary) bg-(--color-card) text-(--color-card-foreground) fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border p-4 shadow-lg">
      <h3 className="mb-2 text-lg font-semibold">
        Install Track N&apos; Stick
      </h3>
      <p className="text-(--color-text-secondary) mb-3 text-sm">
        Install our app on your device for a better experience!
      </p>
      <div className="flex justify-end">
        <Button variant="ghost" onClick={handleDismiss} className="mr-2">
          Not now
        </Button>
        <Button onClick={() => void handleInstallClick()}>Install</Button>
      </div>
    </div>
  );
});
