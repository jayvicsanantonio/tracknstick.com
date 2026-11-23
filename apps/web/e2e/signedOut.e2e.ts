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

test('serves the Apple touch icon the page links as a 180 by 180 PNG', async ({
  page,
  request,
}) => {
  await page.goto('/');

  const href = await page
    .locator('link[rel="apple-touch-icon"]')
    .getAttribute('href');
  expect(href).toBeTruthy();

  const response = await request.get(href ?? '');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toBe('image/png');
  const png = await response.body();
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([180, 180]);
});

for (const theme of ['light', 'dark'] as const) {
  test(`shows the ${theme} theme favicon when the ${theme} theme is chosen`, async ({
    page,
    request,
  }) => {
    await page.addInitScript((chosen) => {
      localStorage.setItem('track-n-stick-theme', chosen);
    }, theme);
    await page.goto('/');

    const href = await page.locator('link[rel="icon"]').getAttribute('href');
    expect(href).toBe(`/icons/favicon-${theme}.svg`);

    const response = await request.get(href ?? '');
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/svg+xml');
  });
}

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('fits everything a first-time visitor needs on one screen', async ({
    page,
  }) => {
    await page.goto('/');

    const getStarted = page.getByRole('button', { name: 'Get started' });
    await expect(getStarted).toBeInViewport({ ratio: 1 });
    await expect(
      page.getByRole('button', { name: 'I already have an account' }),
    ).toBeInViewport({ ratio: 1 });
    // The theme's headline; the layout's own "Welcome" heading is for
    // screen readers only.
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /^(Sparkle Up|Defy Gravity)$/,
      }),
    ).toBeInViewport();
    await expect(
      page.getByRole('list', { name: 'How it works' }),
    ).toBeInViewport({
      ratio: 1,
    });
    // Nothing to scroll for.
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight <= window.innerHeight,
      ),
    ).toBe(true);
  });

  test('keeps Get started in reach on the smallest phone', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');

    await expect(
      page.getByRole('button', { name: 'Get started' }),
    ).toBeInViewport({ ratio: 1 });
  });

  test("signs up in a sheet with Clerk's form, without leaving the page", async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Get started' }).click();

    const sheet = page.getByRole('dialog', { name: 'Create your account' });
    await expect(
      sheet.getByRole('button', { name: /continue with google/i }),
    ).toBeVisible();
    await expect(sheet.getByLabel(/email address/i)).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/');
    expect(new URL(page.url()).hash).toBe('');
    // One way to switch to signing in: the sheet's own. Clerk's link would
    // leave the page for Clerk's hosted sign-in.
    await expect(sheet.getByRole('link', { name: 'Sign in' })).toHaveCount(0);

    // Coming back instead: sign in, in the same sheet.
    // exact: Clerk's Google button is named "Sign in with Google".
    await sheet.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(
      page
        .getByRole('dialog', { name: 'Welcome back' })
        .getByRole('button', { name: /continue with google/i }),
    ).toBeVisible();
  });
});
