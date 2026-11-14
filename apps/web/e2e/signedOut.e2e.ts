// End-to-end check of what a visitor who is not signed in sees.
// Runs without the saved session, in the "signed out" project of playwright.config.ts.

import { expect, test } from '@playwright/test';

test('shows the welcome page and no habit controls to a signed-out visitor', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeAttached();
  await expect(page.getByRole('button', { name: /add habit/i })).toHaveCount(0);
});
