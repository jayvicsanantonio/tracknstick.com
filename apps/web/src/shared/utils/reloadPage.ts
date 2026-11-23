// Reloads the page, for code that has to start the app again from scratch.
// A function of its own so tests can replace it: jsdom's location cannot be stubbed.

export function reloadPage(): void {
  window.location.reload();
}
