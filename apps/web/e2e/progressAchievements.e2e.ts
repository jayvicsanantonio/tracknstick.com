// End-to-end checks of the achievements on the Progress page and its tracks, through the real API and D1.
// Named to run after emptyStates.e2e.ts, which needs the test user to start with no habits.

import { expect, test } from './signedInTest';
import { addHabit } from './addHabit';

test('shows what is left of the next achievements and opens the Tracker from one', async ({
  page,
}) => {
  const name = `Stretch ${Date.now()}`;
  await page.goto('/');
  await addHabit(page, name);

  const checked = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/api/v1/achievements/check',
  );
  await page.getByRole('button', { name: `Mark ${name} as complete` }).click();
  await checked;

  await page.goto('/progress');
  const achievements = page.getByRole('region', { name: 'Achievements' });

  // Achievements no one can earn yet are left out of the count.
  await expect(achievements.getByText(/ of 33 earned$/)).toBeVisible();

  // Each achievement next up says, in words, what is left to do.
  const nextUp = achievements.getByRole('list', { name: 'Next up' });
  const first = nextUp.getByRole('button').first();
  await expect(first).toContainText(/\d+ more |Start a streak today/);

  // The full list groups the series into tracks. The first check-in earns
  // the first level of the check-ins track, which opens to show its date.
  await achievements
    .getByRole('button', { name: 'See all achievements' })
    .click();
  const checkIns = page
    .getByRole('list', { name: 'Tracks' })
    .getByRole('button', { name: /Check-ins/ });
  await expect(checkIns).toContainText(/Level [1-8] of 8/);
  await checkIns.click();
  await expect(
    page
      .getByRole('list', { name: 'Check-ins levels' })
      .getByText(/^Earned [A-Z][a-z]{2} \d{1,2}, \d{4}$/),
  ).toBeVisible();
  await achievements
    .getByRole('button', { name: 'Hide all achievements' })
    .click();

  // Tapping one opens the Tracker, where it is worked toward.
  await first.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('button', { name: `Mark ${name} as incomplete` }),
  ).toBeVisible();
});
