// End-to-end check that panels are flat on every screen size: no blurred glow or gradient inside them.
// It visits each page at phone, tablet and desktop widths with a completed habit on the Tracker.

/// <reference lib="dom" />

import { expect, test, type Page } from '@playwright/test';
import { addHabit } from './addHabit';

/**
 * Deletes a habit from the Habits overview at desktop width, where each row
 * shows its Delete button, so the later tests see the habits they expect.
 */
async function deleteHabit(page: Page, name: string) {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto('/habits');
  const row = page
    .getByRole('list', { name: 'Habits' })
    .getByRole('listitem')
    .filter({ hasText: name });
  await row.getByRole('button', { name: `Delete ${name}` }).click();
  const confirm = page.getByRole('alertdialog', { name: 'Delete Habit' });
  await confirm.getByRole('button', { name: 'Delete' }).click();
  await expect(row).toHaveCount(0);
}

/** Describes each visible element inside a panel that draws a glow or a gradient. */
async function decoratedElements(page: Page) {
  return page.evaluate(() => {
    const panels = document.querySelectorAll<HTMLElement>(
      '.ios-tracker-card, .ios-tracker-card-sm, .ios-tracker-card-lg',
    );
    const found: string[] = [];
    for (const panel of Array.from(panels)) {
      const elements: Element[] = [
        panel,
        ...Array.from(panel.querySelectorAll('*')),
      ];
      for (const element of elements) {
        const box = element.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        const style = getComputedStyle(element);
        const glow = style.filter.includes('blur');
        const gradient = style.backgroundImage.includes('gradient');
        if (glow || gradient) {
          found.push(
            `${element.tagName.toLowerCase()}.${String(element.className).slice(0, 60)}`,
          );
        }
      }
    }
    return found;
  });
}

for (const viewport of [
  { name: 'a phone', width: 390, height: 844 },
  { name: 'a tablet', width: 768, height: 1024 },
  { name: 'a desktop', width: 1280, height: 860 },
]) {
  test.describe(`on ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    let name = '';

    test.afterEach(async ({ page }) => {
      if (name) await deleteHabit(page, name);
      name = '';
    });

    test('draws no glow or gradient inside any panel', async ({ page }) => {
      await page.goto('/');
      name = `Flat ${Date.now()}`;
      await addHabit(page, name);
      // A check-in gives the Progress consistency meter a fill to check.
      await page
        .getByRole('button', { name: `Mark ${name} as complete` })
        .click();

      for (const path of ['/', '/habits', '/progress', '/coach']) {
        await page.goto(path);
        await expect(page.locator('.ios-tracker-card').first()).toBeVisible();
        expect(await decoratedElements(page), path).toEqual([]);
      }
    });
  });
}
