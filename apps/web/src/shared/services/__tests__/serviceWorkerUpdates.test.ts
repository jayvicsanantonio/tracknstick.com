// Covers when a new version of the app is put in place: while the app is out of sight.
// A native app updates between uses; it never reloads in the user's hands or asks first.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { applyUpdateWhenHidden } from '@shared/services/serviceWorkerUpdates';

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: state,
  });
}

describe('applyUpdateWhenHidden', () => {
  afterEach(() => {
    Reflect.deleteProperty(document, 'visibilityState');
  });

  it('leaves the app as it is while it is in use', () => {
    setVisibility('visible');
    const update = vi.fn();

    applyUpdateWhenHidden(update);

    expect(update).not.toHaveBeenCalled();
  });

  it('puts the new version in place once the app is put away', () => {
    setVisibility('visible');
    const update = vi.fn();
    applyUpdateWhenHidden(update);

    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    document.dispatchEvent(new Event('visibilitychange'));

    expect(update).toHaveBeenCalledExactlyOnceWith();
  });

  it('puts it in place at once when the app is already out of sight', () => {
    setVisibility('hidden');
    const update = vi.fn();

    applyUpdateWhenHidden(update);

    expect(update).toHaveBeenCalledExactlyOnceWith();
  });
});
