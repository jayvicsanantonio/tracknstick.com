// End-to-end check that the app opens with the signed-in user's habits when the device is offline.
// Runs in the "offline" project of playwright.config.ts, against a production build with its service worker.

import { expect, test } from '@playwright/test';
import { addHabit } from './addHabit';

/** A habit name no other test or run uses. */
const uniqueName = (label: string) => `${label} ${Date.now()}`;

test("opens with the last visit's habits when offline", async ({
  page,
  context,
}) => {
  const name = uniqueName('Stretch');
  const habit = page.getByRole('button', { name: `Mark ${name} as complete` });

  await page.goto('/');
  await addHabit(page, name);
  await expect(habit).toBeVisible();

  // Once the service worker controls the page, a reload sends the page's
  // requests through it, and it keeps their responses.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(habit).toBeVisible();

  await context.setOffline(true);
  await page.reload();

  await expect(habit).toBeVisible();

  // Back online, the page reloads so Clerk loads, and its account button,
  // which it draws only once loaded, returns.
  const reloaded = page.waitForEvent('load');
  await context.setOffline(false);
  await reloaded;
  await expect(
    page.getByRole('button', { name: 'Open user menu' }),
  ).toBeVisible();
  await expect(habit).toBeVisible();
});
