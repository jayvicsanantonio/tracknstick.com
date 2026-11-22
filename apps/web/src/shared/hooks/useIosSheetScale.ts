// Tracks open mobile iOS sheets via reference counting so the underlying app shell
// smoothly scales down (iOS pageSheet card-stack effect) even with nested sheets.

import { useEffect } from 'react';

let openSheetCount = 0;

function syncShellAttribute() {
  if (typeof document === 'undefined') return;
  if (openSheetCount > 0) {
    document.documentElement.setAttribute('data-ios-sheet-open', 'true');
  } else {
    document.documentElement.removeAttribute('data-ios-sheet-open');
  }
}

export function useIosSheetScale(isOpen: boolean): void {
  useEffect(() => {
    if (!isOpen) return;
    openSheetCount += 1;
    syncShellAttribute();
    return () => {
      openSheetCount = Math.max(0, openSheetCount - 1);
      syncShellAttribute();
    };
  }, [isOpen]);
}
