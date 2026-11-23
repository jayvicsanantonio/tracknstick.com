// End-to-end checks of the launch splash: it paints before any script, then gives way to the app.
// Its medallion sits at the centre of the screen, where the iOS launch images draw it.

import { expect, test } from '@playwright/test';

const splash = (page: import('@playwright/test').Page) =>
  page.getByRole('status', { name: "Loading Track N' Stick" });

test('paints the splash before any script runs, at the centre of the screen', async ({
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
