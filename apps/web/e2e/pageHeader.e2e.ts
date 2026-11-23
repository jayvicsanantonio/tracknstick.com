// End-to-end check that every signed-in page shows its title in the same place on tablet and desktop.
// Measures each page's title and description, so a page that drifts from the shared PageHeader fails.

import { expect, test, type Page } from '@playwright/test';

const PAGES = [
  { path: '/', description: 'Check off the habits scheduled for this day' },
  { path: '/habits', description: 'Manage all your habits in one place' },
  { path: '/progress', description: 'View your progress in one place' },
  {
    path: '/coach',
    description: 'Advice grounded in Atomic Habits by James Clear',
  },
];

/** Where the page's description line sits, once it is on screen. */
async function descriptionBox(page: Page, description: string) {
  const line = page.getByText(description, { exact: true });
  await expect(line).toBeVisible();
  const box = await line.boundingBox();
  if (!box) throw new Error(`"${description}" did not render`);
  return box;
}

for (const viewport of [
  { name: 'a tablet', width: 768, height: 1024 },
  { name: 'a desktop', width: 1280, height: 860 },
]) {
  test.describe(`on ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('every page puts its title and description in the same place', async ({
      page,
    }) => {
      const boxes = [];
      for (const { path, description } of PAGES) {
        await page.goto(path);
        boxes.push({ path, box: await descriptionBox(page, description) });
      }

      const [first, ...rest] = boxes;
      for (const { path, box } of rest) {
        expect(Math.abs(box.x - first.box.x), path).toBeLessThanOrEqual(1);
        expect(Math.abs(box.y - first.box.y), path).toBeLessThanOrEqual(1);
      }
    });
  });
}

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('leaves the description to the tablet and desktop header', async ({
    page,
  }) => {
    for (const { path, description } of PAGES) {
      await page.goto(path);
      await expect(page.getByText(description, { exact: true })).toBeHidden();
    }
  });
});
