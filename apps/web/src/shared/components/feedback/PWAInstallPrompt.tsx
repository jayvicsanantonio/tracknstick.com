// Install prompt for both Chromium (beforeinstallprompt) and iOS Safari
// (native-feeling "Add to Home Screen" instructional bottom sheet when not yet standalone).

import { useState, useEffect, useCallback, memo } from 'react';
import { PlusSquare, Share, X } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { triggerHaptic } from '@shared/utils/haptics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const IOS_DISMISS_KEY = 'track-n-stick-ios-install-dismissed';

function isIosSafariNotStandalone(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIos) return false;

  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (isStandalone) return false;

  // Exclude Chrome/Firefox/Edge on iOS where Safari's bottom Share flow differs slightly,
  // or keep Safari primary.
  const isSafari = ua.includes('Safari') && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isSafari;
}

export const PWAInstallPrompt = memo(function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (
        isIosSafariNotStandalone() &&
        localStorage.getItem(IOS_DISMISS_KEY) !== '1'
      ) {
        iosTimer = setTimeout(() => setShowIosGuide(true), 2200);
      }
    } catch {
      // Ignore storage read errors
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    triggerHaptic('medium');
    void deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    triggerHaptic('light');
    setIsVisible(false);
  }, []);

  const handleDismissIos = useCallback(() => {
    triggerHaptic('light');
    setShowIosGuide(false);
    try {
      localStorage.setItem(IOS_DISMISS_KEY, '1');
    } catch {
      // Ignore storage write errors
    }
  }, []);

  if (showIosGuide) {
    return (
      <div
        role="region"
        aria-label="Add to Home Screen"
        className="ios-liquid-glass fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-50 rounded-3xl p-4 text-(--color-foreground) sm:hidden"
      >
        <div className="flex items-start gap-3">
          <img
            src="/icons/apple-touch-icon.png"
            alt=""
            className="size-12 shrink-0 rounded-[22.37%] shadow-sm ring-1 ring-black/10"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold tracking-tight text-(--color-foreground)">
              Install Track N&apos; Stick
            </h3>
            <p className="mt-0.5 text-[13px] leading-snug text-(--color-text-secondary)">
              Add to your Home Screen for the full-screen native app experience.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismissIos}
            aria-label="Dismiss install guide"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-(--color-muted) text-(--color-text-secondary) active:scale-90"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <ol className="mt-3 space-y-2 rounded-2xl bg-(--color-surface)/65 px-3.5 py-2.5 text-[13px] text-(--color-foreground) dark:bg-(--color-surface-tertiary)/50">
          <li className="flex items-center gap-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-(--color-brand-primary)/15 text-(--color-brand-primary)">
              <Share aria-hidden="true" className="size-3.5" />
            </span>
            <span>
              Tap the <strong className="font-semibold">Share</strong> button in
              Safari&apos;s toolbar
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-(--color-brand-primary)/15 text-(--color-brand-primary)">
              <PlusSquare aria-hidden="true" className="size-3.5" />
            </span>
            <span>
              Scroll and tap{' '}
              <strong className="font-semibold">Add to Home Screen</strong>
            </span>
          </li>
        </ol>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="ios-liquid-glass fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-50 rounded-3xl p-4 text-(--color-card-foreground) sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-sm sm:rounded-2xl">
      <h3 className="mb-1 text-base font-semibold">
        Install Track N&apos; Stick
      </h3>
      <p className="mb-3 text-sm text-(--color-text-secondary)">
        Install our app on your device for a faster, full-screen experience.
      </p>
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={handleDismiss}
          className="rounded-full"
        >
          Not now
        </Button>
        <Button
          onClick={() => void handleInstallClick()}
          className="rounded-full"
        >
          Install
        </Button>
      </div>
    </div>
  );
});
