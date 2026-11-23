// Takes down the launch splash drawn in index.html once the app has something to show.
// It fades out first, then leaves the page, so nothing of it is left behind the app.

import { useEffect } from 'react';

/** How long index.html's #splash takes to fade, with a little to spare. */
const FADE_MS = 400;

export function useHideSplash(ready: boolean): void {
  useEffect(() => {
    if (!ready) return;
    const splash = document.getElementById('splash');
    if (!splash) return;

    splash.classList.add('splash-done');
    // A timer rather than transitionend, which never fires when reduced
    // motion or a hidden tab skips the fade.
    window.setTimeout(() => splash.remove(), FADE_MS);
  }, [ready]);
}
