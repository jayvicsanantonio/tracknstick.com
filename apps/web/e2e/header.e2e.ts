// End-to-end check of the header's layout: the logo pill and the toolbar line up as one row.
// Measured in a real browser at desktop and phone widths, where jsdom cannot lay anything out.

import { expect, test, type Page } from '@playwright/test';

/** The logo's and the toolbar's boxes, once both have rendered. */
async function headerBoxes(page: Page) {
  const logo = page.getByRole('link', { name: "Track N' Stick" });
  const toolbar = page.getByRole('toolbar', { name: 'User actions' });
  await expect(logo).toBeVisible();
  await expect(toolbar).toBeVisible();
  const [logoBox, toolbarBox] = await Promise.all([
    logo.boundingBox(),
    toolbar.boundingBox(),
  ]);
  if (!logoBox || !toolbarBox) throw new Error('The header did not render');
  return { logoBox, toolbarBox };
}

for (const [device, viewport] of [
  ['desktop', { width: 1280, height: 860 }],
  ['phone', { width: 390, height: 844 }],
] as const) {
  test.describe(`on a ${device}`, () => {
    test.use({ viewport });

    test('the logo and the toolbar share one height and one centre line', async ({
      page,
    }) => {
      await page.goto('/');
      const { logoBox, toolbarBox } = await headerBoxes(page);

      expect(Math.abs(logoBox.height - toolbarBox.height)).toBeLessThanOrEqual(
        1,
      );
      const centre = (box: { y: number; height: number }) =>
        box.y + box.height / 2;
      expect(
        Math.abs(centre(logoBox) - centre(toolbarBox)),
      ).toBeLessThanOrEqual(1);
    });

    test('the logo takes you to the tracker', async ({ page }) => {
      await page.goto('/habits');
      await page.getByRole('link', { name: "Track N' Stick" }).click();
      await expect(page).toHaveURL(/\/$/);
    });
  });
}
