// Signs in as the Clerk test user once, before the signed-in tests, and saves the session.
// Uses Clerk's testing helpers, which sign in through the Backend API and bypass bot protection.

import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { expect, test as setup } from '@playwright/test';
import { AUTH_FILE } from './authFile';

// clerkSetup() must finish before the sign-in step uses its Testing Token.
setup.describe.configure({ mode: 'serial' });

setup('get a Clerk Testing Token', async () => {
  await clerkSetup();
});

setup('sign in as the test user', async ({ page }) => {
  const emailAddress = process.env.E2E_CLERK_USER_EMAIL;
  if (!emailAddress) {
    throw new Error('E2E_CLERK_USER_EMAIL is not set. See e2e/README.md.');
  }

  // Clerk has to be loaded on the page, and the signed-out home page loads it.
  await page.goto('/');
  await clerk.signIn({ page, emailAddress });

  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Add Habit' })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
