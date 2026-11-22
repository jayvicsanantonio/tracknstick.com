// The pages' titles: the names of their tabs, as iOS titles a tab's page.
// Each page shows its title large at its top; the phone's top bar shows it small once that scrolls away.

const PAGE_TITLES: Record<string, string> = {
  '/': 'Tracker',
  '/habits': 'Habits',
  '/progress': 'Progress',
  '/coach': 'Coach',
};

/** The title of the page at this path, or undefined for one that is not a tab. */
export function pageTitleFor(pathname: string): string | undefined {
  return PAGE_TITLES[pathname];
}
