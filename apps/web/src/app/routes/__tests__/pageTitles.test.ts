// Covers the pages' titles: the names of their tabs, shown large on the page and small in the top bar.
// A path that is not a tab has no title.

import { describe, it, expect } from 'vitest';
import { pageTitleFor } from '@app/routes/pageTitles';

describe('pageTitleFor', () => {
  it.each([
    ['/', 'Tracker'],
    ['/habits', 'Habits'],
    ['/progress', 'Progress'],
    ['/coach', 'Coach'],
  ])('names %s "%s", as its tab does', (path, title) => {
    expect(pageTitleFor(path)).toBe(title);
  });

  it('has no title for a page that is not a tab', () => {
    expect(pageTitleFor('/nowhere')).toBeUndefined();
  });
});
