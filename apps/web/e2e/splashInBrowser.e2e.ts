// End-to-end check that a phone's browser tab never shows the launch splash, which only the installed app does.
// The installed app's splash is covered in splash.e2e.ts, which needs a browser launched in standalone mode.

import { expect, test } from '@playwright/test';

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

test("opens straight to the page in a phone's browser tab, without the splash", async ({
  page,
}) => {
  // Hold the app's script back, as a slow connection would.
  let release = () => undefined as void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/src/main.tsx', async (route) => {
    await held;
    await route.continue();
  });

  // 'commit': the page's own events wait for its scripts, which are held.
  await page.goto('/', { waitUntil: 'commit' });

  await expect(page.locator('#splash')).toBeAttached();
  await expect(page.locator('#splash')).toBeHidden();

  release();
});
