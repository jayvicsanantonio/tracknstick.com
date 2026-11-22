// A short haptic tick for a tap that changes something, like ticking off a habit.
// Vibrates where the browser can; on iOS, which has no vibration API, toggles a hidden switch.

/**
 * Taps the phone once. Call it from the tap itself.
 *
 * Safari on iOS has no `navigator.vibrate`, but from iOS 18 it taps the phone
 * whenever an `<input type="checkbox" switch>` is toggled, as a native switch
 * does. A hidden switch is made, clicked through its label, and taken away
 * again in the same moment. Elsewhere the switch is an ordinary checkbox and
 * the click does nothing anyone sees.
 */
export function hapticTick(): void {
  if (typeof navigator.vibrate === 'function') {
    navigator.vibrate(10);
    return;
  }

  const label = document.createElement('label');
  label.ariaHidden = 'true';
  label.style.display = 'none';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  label.append(input);
  document.head.append(label);
  label.click();
  label.remove();
}
