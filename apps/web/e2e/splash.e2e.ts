// End-to-end checks of the launch splash in an app opened from a phone's home screen: it paints before any
// script, at the centre of the screen where the iOS launch images draw its medallion, then gives way to the app.

import { expect, test } from '@playwright/test';

const splash = (page: import('@playwright/test').Page) =>
  page.getByRole('status', { name: "Loading Track N' Stick" });

/** Holds the app's script back, as a slow connection would, until released. */
async function holdAppScript(page: import('@playwright/test').Page) {
  let release = () => undefined as void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/src/main.tsx', async (route) => {
    await held;
    await route.continue();
  });
  return release;
}

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  // Opens every page the way the home screen opens the installed app, in
  // display-mode: standalone. Chromium has no emulation for it, only this
  // setting, whose 3 is blink::mojom::DisplayMode::kStandalone.
  launchOptions: { args: ['--blink-settings=displayModeOverride=3'] },
});

test('paints the splash before any script runs, at the centre of the screen', async ({
  page,
}) => {
  const release = await holdAppScript(page);

  // 'commit': the page's own events wait for its scripts, which are held.
  await page.goto('/', { waitUntil: 'commit' });

  await expect(splash(page)).toBeVisible();
  await expect(page.getByText("Track N' Stick", { exact: true })).toBeVisible();
  const viewport = page.viewportSize();
  const medallion = await page.locator('#splash svg').boundingBox();
  expect(medallion).not.toBeNull();
  if (viewport && medallion) {
    expect(medallion.x + medallion.width / 2).toBeCloseTo(
      viewport.width / 2,
      0,
    );
    expect(medallion.y + medallion.height / 2).toBeCloseTo(
      viewport.height / 2,
      0,
    );
  }

  release();
});

test('gives way to the app once it is ready', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('button', { name: 'Add Habit', exact: true }),
  ).toBeVisible();
  await expect(page.locator('#splash')).toHaveCount(0);
});

test.describe('installed on a desktop', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    hasTouch: false,
    isMobile: false,
  });

  test('opens straight to the page, without the splash', async ({ page }) => {
    const release = await holdAppScript(page);

    await page.goto('/', { waitUntil: 'commit' });

    await expect(page.locator('#splash')).toBeAttached();
    await expect(page.locator('#splash')).toBeHidden();

    release();
  });
});
