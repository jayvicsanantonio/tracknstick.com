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
