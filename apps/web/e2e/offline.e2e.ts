// End-to-end check that the app opens with the signed-in user's habits when the device is offline.
// Runs in the "production build" project of playwright.config.ts, against a production build with its service worker.

import { expect, test } from './signedInTest';
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

test("opens with the last visit's habits on a connection that gets nowhere", async ({
  page,
  context,
}) => {
  // Clerk gives up on its script after 15 seconds.
  test.setTimeout(60_000);
  const name = uniqueName('Breathe');
  const habit = page.getByRole('button', { name: `Mark ${name} as complete` });

  await page.goto('/');
  await addHabit(page, name);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(habit).toBeVisible();

  // Wi-Fi without internet: the browser still reports a connection, but
  // nothing reaches Clerk or the API.
  await context.route(
    (url) => url.hostname.includes('clerk') || url.port === '8787',
    (route) => route.abort('internetdisconnected'),
  );
  await page.reload();

  await expect(habit).toBeVisible({ timeout: 30_000 });
});

test('saves a habit completed offline once the connection returns', async ({
  page,
  context,
}) => {
  const name = uniqueName('Journal');
  const incomplete = page.getByRole('button', {
    name: `Mark ${name} as complete`,
  });
  const complete = page.getByRole('button', {
    name: `Mark ${name} as incomplete`,
  });

  await page.goto('/');
  await addHabit(page, name);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(incomplete).toBeVisible();

  await context.setOffline(true);
  await page.reload();
  await incomplete.click();
  await expect(complete).toHaveAttribute('aria-pressed', 'true');

  // Kept on the device: a reload, still offline, shows it completed.
  await page.reload();
  await expect(complete).toHaveAttribute('aria-pressed', 'true');

  // Back online, the page reloads, Clerk loads, and the change is sent.
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith('/trackers') &&
      response.ok(),
  );
  await context.setOffline(false);
  await saved;
  await expect
    .poll(() =>
      page.evaluate(() =>
        localStorage.getItem('track-n-stick-pending-completions'),
      ),
    )
    .toBeNull();

  // The API has it: with nothing left on the device, a reload shows it.
  await page.reload();
  await expect(complete).toHaveAttribute('aria-pressed', 'true');
});

test("opens the Progress page with the last visit's progress when offline", async ({
  page,
  context,
}) => {
  const summary = page.getByRole('region', {
    name: 'All-time progress summary',
  });
  const calendar = page.getByRole('region', { name: 'Calendar' });

  await page.goto('/progress');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(summary).toBeVisible();
  await expect(calendar).toBeVisible();

  await context.setOffline(true);
  await page.reload();

  await expect(summary).toBeVisible();
  await expect(calendar).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});
