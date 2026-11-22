// End-to-end check of the header layout:
// Desktop shows the aligned glass logo pill and toolbar; phones hide the website header
// and render the native iOS Collapsing Large Title bar with the profile/settings avatar.

import { expect, test, type Page } from '@playwright/test';

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

test.describe('on desktop', () => {
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

  test('hides the web brand header and opens Settings from the profile button', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page.getByRole('link', { name: "Track N' Stick" }),
    ).toBeHidden();
    const profileBtn = page.getByRole('button', {
      name: 'Open profile and settings',
    });
    await expect(profileBtn).toBeVisible();

    await profileBtn.click();
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
  });
});
