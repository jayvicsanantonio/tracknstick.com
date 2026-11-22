// Puts a new version of the app in place while the app is out of sight, as a native app updates between uses.
// The service worker reports a waiting update; this applies it once the app is hidden.

/**
 * Runs `update` the next time the app is hidden: the user switched apps,
 * went to the home screen or locked the phone. Applying an update reloads
 * the page, which in the user's hands would throw away what they were doing.
 * Hidden, the reload goes unseen, and they come back to the new version.
 */
export function applyUpdateWhenHidden(update: () => void): void {
  if (document.visibilityState === 'hidden') {
    update();
    return;
  }
  const onVisibilityChange = () => {
    if (document.visibilityState !== 'hidden') return;
    document.removeEventListener('visibilitychange', onVisibilityChange);
    update();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
}
