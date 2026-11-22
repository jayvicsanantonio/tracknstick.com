// Whether the app runs from the home screen, on its own, rather than in a browser tab.
// Website parts, like a footer, stay out of the installed app.

/** Safari's own flag for a home-screen app, which lib.dom does not describe. */
type NavigatorWithStandalone = Navigator & { standalone?: boolean };

export function isInstalledApp(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as NavigatorWithStandalone).standalone === true
  );
}
