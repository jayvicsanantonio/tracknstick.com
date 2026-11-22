// End-to-end checks of the header: on a desktop the logo and toolbar line up as one row; on a phone an iOS top bar.
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

test.describe('on a desktop', () => {
  test.use({ viewport: { width: 1280, height: 860 } });

  test('the logo and the toolbar share one height and one centre line', async ({
    page,
  }) => {
    await page.goto('/');
    const { logoBox, toolbarBox } = await headerBoxes(page);

    expect(Math.abs(logoBox.height - toolbarBox.height)).toBeLessThanOrEqual(1);
    const centre = (box: { y: number; height: number }) =>
      box.y + box.height / 2;
    expect(Math.abs(centre(logoBox) - centre(toolbarBox))).toBeLessThanOrEqual(
      1,
    );
  });

  test('the logo takes you to the tracker', async ({ page }) => {
    await page.goto('/habits');
    await page.getByRole('link', { name: "Track N' Stick" }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('names the page in a large title, and in the top bar once it scrolls away', async ({
    page,
  }) => {
    await page.goto('/progress');
    const title = page.getByRole('heading', { level: 1, name: 'Progress' });
    await expect(title).toBeVisible();
    await expect(
      page.getByRole('link', { name: "Track N' Stick" }),
    ).toBeHidden();
    const bar = page.locator('[data-phone-bar]');
    await expect(bar).toHaveAttribute('data-scrolled', 'false');

    await expect(
      page.getByRole('status', { name: /^Current streak/ }),
    ).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 300));

    await expect(bar).toHaveAttribute('data-scrolled', 'true');
    await expect(bar).toContainText('Progress');
  });

  test('keeps the account button in the top bar', async ({ page }) => {
    await page.goto('/');

    const account = page.getByRole('button', { name: /open user menu/i });
    await expect(account).toBeVisible();
    const box = await account.boundingBox();
    expect(box?.y).toBeLessThan(100);
  });
});
