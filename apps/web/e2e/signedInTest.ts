// Playwright's test for the signed-in pages, with a page that closes the achievement celebration whenever it opens.
// Adding or checking off a habit can earn an achievement, and its sheet would block a test's next action.

import { test as base, type Page } from '@playwright/test';

export { expect } from '@playwright/test';

/** The sheet that celebrates a newly earned achievement. */
export function achievementCelebration(page: Page) {
  return page.getByRole('dialog').filter({ hasText: 'Achievement earned' });
}

/** Closes each celebration, and any that follow it, before the next action. */
async function closeAchievementCelebrations(page: Page) {
  const celebration = achievementCelebration(page);
  await page.addLocatorHandler(celebration, async () => {
    while (await celebration.isVisible()) {
      await celebration
        .getByRole('button', { name: /^(Keep going|Next achievement)$/ })
        .click();
    }
  });
}

export const test = base.extend({
  // Named `provide`, not Playwright's usual `use`, so the React hooks lint
  // rule does not take it for a hook.
  page: async ({ page }, provide) => {
    await closeAchievementCelebrations(page);
    await provide(page);
  },
});
