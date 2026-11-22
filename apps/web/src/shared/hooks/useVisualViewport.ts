// Tracks the iOS/mobile visualViewport height and software keyboard open state
// so fixed composers (Coach) dock cleanly above the keyboard and the bottom Tab Bar hides
// ONLY when a text input is actively focused on a touch device.

import { useEffect, useState } from 'react';

interface VisualViewportState {
  /** Live visual viewport height in pixels (null until measured or unsupported). */
  height: number | null;
  /** True only while a text input is focused and the mobile software keyboard is open. */
  isKeyboardOpen: boolean;
}

const KEYBOARD_SHRINK_THRESHOLD = 140;

function isTextInputFocused(): boolean {
  if (typeof document === 'undefined') return false;
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') {
    const type = (active as HTMLInputElement).type;
    return ![
      'checkbox',
      'radio',
      'button',
      'submit',
      'reset',
      'range',
      'file',
    ].includes(type);
  }
  return active instanceof HTMLElement && active.isContentEditable;
}

export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>({
    height: null,
    isKeyboardOpen: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;

    const measure = () => {
      const innerHeight = window.innerHeight;
      const liveHeight = vv ? Math.round(vv.height) : innerHeight;
      const shrunk = innerHeight - liveHeight > KEYBOARD_SHRINK_THRESHOLD;
      const isCoarsePointer =
        window.matchMedia?.('(pointer: coarse)').matches ?? false;
      const focusedInput = isTextInputFocused();
      // Never hide the tab bar unless a text input actually has focus — prevents
      // iOS Safari address-bar or zoom transitions from falsely triggering keyboard mode.
      const nextOpen = focusedInput && (isCoarsePointer || shrunk);

      setState((prev) => {
        if (prev.height === liveHeight && prev.isKeyboardOpen === nextOpen) {
          return prev;
        }
        return { height: liveHeight, isKeyboardOpen: nextOpen };
      });
    };

    measure();
    vv?.addEventListener('resize', measure);
    vv?.addEventListener('scroll', measure);
    window.addEventListener('resize', measure);
    document.addEventListener('focusin', measure);
    document.addEventListener('focusout', measure);

    return () => {
      vv?.removeEventListener('resize', measure);
      vv?.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      document.removeEventListener('focusin', measure);
      document.removeEventListener('focusout', measure);
    };
  }, []);

  return state;
}
