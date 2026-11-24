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

  test('puts the Large Title beside the profile button, with no row above it', async ({
    page,
  }) => {
    await page.goto('/');

    // The Large Title is decorative (the page heading is for screen
    // readers), so it is found by its text.
    const title = page.locator('p:visible', { hasText: /^Today$/ });
    const profileBtn = page.getByRole('button', {
      name: 'Open profile and settings',
    });
    const [titleBox, profileBox] = await Promise.all([
      title.boundingBox(),
      profileBtn.boundingBox(),
    ]);
    if (!titleBox || !profileBox) throw new Error('The nav bar did not render');

    const centre = (box: { y: number; height: number }) =>
      box.y + box.height / 2;
    expect(Math.abs(centre(titleBox) - centre(profileBox))).toBeLessThanOrEqual(
      4,
    );
    expect(profileBox.y).toBeLessThanOrEqual(16);
  });

  test('on another day, double-tapping the date goes back to today', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Previous Date' }).click();

    // No visible button: the gesture, and its hint, take you back.
    await expect(
      page.getByRole('button', { name: 'Today', exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText('Swipe to switch days · Double-tap the date for today'),
    ).toBeVisible();

    await page.getByText(/^[A-Z][a-z]{2} \d{1,2}/).dblclick();

    await expect(page.getByRole('heading', { name: 'Today' })).toBeAttached();
    await expect(page.getByText('Swipe to switch days')).toBeVisible();
  });
});
