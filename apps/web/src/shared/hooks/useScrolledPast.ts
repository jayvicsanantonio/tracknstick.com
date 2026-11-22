// Whether the page has scrolled beyond a given point, kept up to date as it scrolls.
// The phone's top bar uses it to show the page's name once the large title has gone under it.

import { useEffect, useState } from 'react';

export function useScrolledPast(offset: number): boolean {
  const [past, setPast] = useState(() => window.scrollY > offset);

  useEffect(() => {
    const update = () => setPast(window.scrollY > offset);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [offset]);

  return past;
}
