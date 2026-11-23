// End-to-end checks of the service worker: what it keeps, how fast it falls back, how it updates.
// Runs in the "production build" project of playwright.config.ts, the only build with a service worker.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { addHabit } from './addHabit';

// The service worker of the build `vite preview` serves (PREVIEW_OUT_DIR in
// playwright.config.ts). The preview server reads it from disk on each request.
const SERVICE_WORKER = fileURLToPath(new URL('.dist/sw.js', import.meta.url));

/** A habit name no other test or run uses. */
const uniqueName = (label: string) => `${label} ${Date.now()}`;

/** Waits until the service worker is active and controls the page. */
async function controlledByServiceWorker(page: Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
}

test('keeps the habit sounds, so they play at once and offline', async ({
  page,
}) => {
  await page.goto('/');
  await controlledByServiceWorker(page);

  const cachedSounds = await page.evaluate(async () => {
    const urls: string[] = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) urls.push(request.url);
    }
    return urls.filter((url) => new URL(url).pathname.endsWith('.mp3'));
  });

  expect(cachedSounds).toEqual(
    expect.arrayContaining([
      expect.stringContaining('/habit-toggled-on-'),
      expect.stringContaining('/habit-toggled-off-'),
      expect.stringContaining('/completed-all-habits-'),
    ]),
  );
});

test('leaves the iOS launch images, one for every device, out of its cache', async ({
  page,
}) => {
  await page.goto('/');
  await controlledByServiceWorker(page);

  const cached = await page.evaluate(async () => {
    const urls: string[] = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) urls.push(request.url);
    }
    return urls;
  });

  expect(cached.length).toBeGreaterThan(0);
  expect(cached.filter((url) => url.includes('/splash/'))).toEqual([]);
});

test('shows the last answer within seconds when the API is slow to reply', async ({
  page,
  context,
}) => {
  const name = uniqueName('Hydrate');
  const habit = page.getByRole('button', { name: `Mark ${name} as complete` });

  await page.goto('/');
  await addHabit(page, name);
  await controlledByServiceWorker(page);
  await expect(habit).toBeVisible();

  // A weak signal: the API answers, but only after ten seconds.
  await context.route(
    (url) => url.port === '8787',
    async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      await route.continue().catch(() => undefined);
    },
  );
  await page.reload();

  await expect(habit).toBeVisible({ timeout: 6_000 });
});

test('offers a new version instead of reloading the page by itself', async ({
  page,
}) => {
  await page.goto('/');
  await controlledByServiceWorker(page);

  // The next deploy: the same service worker with one byte more. Playwright
  // cannot route the browser's own fetch of it, so the file itself changes.
  const deployed = readFileSync(SERVICE_WORKER, 'utf8');
  writeFileSync(SERVICE_WORKER, `${deployed}\n// the next version`);
  try {
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    });

    const reload = page
      .getByRole('status')
      .filter({ hasText: 'Update available' })
      .getByRole('button', { name: 'Reload' });
    await expect(reload).toBeVisible();

    const reloaded = page.waitForEvent('load');
    await reload.click();
    await reloaded;
  } finally {
    writeFileSync(SERVICE_WORKER, deployed);
  }
});
