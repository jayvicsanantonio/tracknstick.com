import { useState, useEffect } from 'react';
import { Button } from '@shared/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
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

  const handleInstallClick = async () => {
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
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className="mb-2 text-lg font-semibold">
        Install Track N&apos; Stick
      </h3>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">
        Install our app on your device for a better experience!
      </p>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={() => setIsVisible(false)}
          className="mr-2"
        >
          Not now
        </Button>
        <Button onClick={() => void handleInstallClick()}>Install</Button>
      </div>
    </div>
  );
}
