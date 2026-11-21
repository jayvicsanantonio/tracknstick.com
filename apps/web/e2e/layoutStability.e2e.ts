// End-to-end checks that the layout holds still: loading, moving between pages, tabs and dialogs shift nothing.
// Records the browser's layout-shift entries around each interaction, counting those right after a click too.

// The scripts below that run in the page use the browser's types.
/// <reference lib="dom" />

import {
  expect,
  test,
  type Browser,
  type Page,
  type TestInfo,
} from '@playwright/test';
import { AUTH_FILE } from './authFile';

const EVERY_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Long enough for the slowest entrance animation and a local API response.
const SETTLE_MS = 1200;

// The most a step may score. Text re-centering inside a box that holds still,
// as a day's name changes length, scores well under it; a block of the page
// moving, even by a few pixels, scores over it.
const MAX_STEP_SCORE = 0.001;

interface Shift {
  value: number;
  /** Each moved element, with its box before and after: "x,y w×h -> x,y w×h". */
  moved: string[];
}

/** Records every layout shift on the page, from its first paint on. */
async function recordShifts(page: Page) {
  await page.addInitScript(() => {
    const log: { value: number; moved: string[] }[] = [];
    const box = (rect: DOMRectReadOnly) =>
      `${Math.round(rect.x)},${Math.round(rect.y)} ${Math.round(rect.width)}×${Math.round(rect.height)}`;
    (window as unknown as { __layoutShifts: typeof log }).__layoutShifts = log;
    const name = (node: Node | null) => {
      const element =
        node?.nodeType === Node.ELEMENT_NODE
          ? (node as Element)
          : node?.parentElement;
      if (!element) return 'text';
      const text = (element.textContent ?? '').trim().slice(0, 40);
      return `<${element.tagName.toLowerCase()}> "${text}"`;
    };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as {
        value: number;
        sources?: {
          node: Node | null;
          previousRect: DOMRectReadOnly;
          currentRect: DOMRectReadOnly;
        }[];
      }[]) {
        log.push({
          value: entry.value,
          moved: (entry.sources ?? []).map(
            (source) =>
              `${name(source.node)} ${box(source.previousRect)} -> ${box(source.currentRect)}`,
          ),
        });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

/**
 * Hides the footer. On a phone it sits under the tab bar, out of sight, and
 * follows the height of the content above it.
 */
async function hideFooter(page: Page) {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = 'footer { visibility: hidden; }';
      document.head.append(style);
    });
  });
}

async function takeShifts(page: Page): Promise<Shift[]> {
  return page.evaluate(() => {
    // Before the first page loads there is nothing to record.
    const log =
      (window as unknown as { __layoutShifts?: Shift[] }).__layoutShifts ?? [];
    return log.splice(0, log.length);
  });
}

/** Runs an interaction and expects nothing on screen to have moved by the time it settles. */
async function expectNoShift(
  page: Page,
  step: string,
  action: () => Promise<void>,
) {
  await takeShifts(page);
  await action();
  await page.waitForTimeout(SETTLE_MS);
  const shifts = await takeShifts(page);
  const score = shifts.reduce((sum, shift) => sum + shift.value, 0);
  expect(score, `${step}: ${JSON.stringify(shifts, null, 2)}`).toBeLessThan(
    MAX_STEP_SCORE,
  );
}

/** Waits for a page's data and entrance animations, so a test measures only its own step. */
async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(SETTLE_MS);
}

async function addHabit(page: Page, name: string) {
  await page.getByRole('button', { name: 'Add Habit', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Add New Habit' });
  await dialog.getByLabel('Name').fill(name);
  const activity = page.getByRole('radio', { name: 'Activity' });
  await dialog.locator('label', { has: activity }).click();
  for (const day of EVERY_DAY) {
    await dialog.getByRole('button', { name: day, exact: true }).click();
  }
  await dialog.getByRole('button', { name: 'Add habit' }).click();
  await expect(dialog).toBeHidden();
}

/**
 * Adds an everyday habit, in a session of its own, for the tracker, the
 * overview and the progress page to show. Returns its name, which no other
 * test or run uses.
 */
async function seedHabit(
  browser: Browser,
  testInfo: TestInfo,
  label: string,
): Promise<string> {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    storageState: AUTH_FILE,
  });
  const page = await context.newPage();
  await page.goto('/');
  const name = `${label} ${Date.now()}`;
  await addHabit(page, name);
  await context.close();
  return name;
}

/** The tracker's button that marks this habit done or not done. */
function markButton(page: Page, habit: string) {
  return page.getByRole('button', {
    name: new RegExp(`^Mark ${habit} as (in)?complete$`),
  });
}

/** The header's or the tab bar's link to a page, whichever this width shows. */
function navLink(page: Page, name: RegExp) {
  return page
    .getByRole('toolbar', { name: 'User actions' })
    .or(page.getByRole('navigation', { name: 'Primary' }))
    .getByRole('link', { name })
    .locator('visible=true');
}

for (const [device, viewport] of [
  ['desktop', { width: 1280, height: 860 }],
  ['phone', { width: 390, height: 844 }],
] as const) {
  test.describe(`on a ${device}`, () => {
    test.use({ viewport });

    let habit = '';

    test.beforeAll(async ({ browser }, testInfo) => {
      habit = await seedHabit(browser, testInfo, `Steady ${device}`);
    });

    test.beforeEach(async ({ page }) => {
      await recordShifts(page);
      if (device === 'phone') await hideFooter(page);
    });

    test('loads the tracker, header and account button without a shift', async ({
      page,
    }) => {
      await expectNoShift(page, 'loading the tracker', async () => {
        await page.goto('/');
        await expect(markButton(page, habit)).toBeVisible();
        await expect(
          page.getByRole('button', { name: /open user menu/i }),
        ).toBeVisible();
      });
    });

    test('moves between days without moving the arrows or the habits', async ({
      page,
    }) => {
      await page.goto('/');
      await expect(markButton(page, habit)).toBeVisible();
      await settle(page);

      // Forward from today, where the everyday habit is due on each day,
      // through day names of every length.
      for (let day = 1; day <= 7; day++) {
        await expectNoShift(page, `${day} days ahead`, () =>
          page.getByRole('button', { name: 'Next Date' }).click(),
        );
      }
      await expectNoShift(page, 'a day back', () =>
        page.getByRole('button', { name: 'Previous Date' }).click(),
      );
    });

    test('moves between the tracker and the coach with the footer standing still', async ({
      page,
    }) => {
      await page.goto('/');
      await expect(markButton(page, habit)).toBeVisible();
      await settle(page);

      for (const [link, url] of [
        [/Coach$/, /\/coach$/],
        [/Tracker$/, /\/$/],
        [/Coach$/, /\/coach$/],
      ] as const) {
        await expectNoShift(page, `to ${url}`, async () => {
          await navLink(page, link).click();
          await expect(page).toHaveURL(url);
        });
      }
    });

    test('switches the habit tabs and searches without a shift', async ({
      page,
    }) => {
      await page.goto('/habits');
      const search = page.getByRole('searchbox', { name: 'Search habits' });
      await expect(search).toBeVisible();
      await settle(page);

      await expectNoShift(page, 'the Archived tab', () =>
        page.getByRole('tab', { name: 'Archived' }).click(),
      );
      await expectNoShift(page, 'the All tab', () =>
        page.getByRole('tab', { name: 'All' }).click(),
      );
      await expectNoShift(page, 'a search that matches nothing', () =>
        search.fill('no habit is named this'),
      );
      await expectNoShift(page, 'clearing the search', () => search.fill(''));
    });

    test('opens a habit with its form in place and keeps its size between Edit and Stats', async ({
      page,
    }) => {
      await page.goto('/habits');
      const edit = page
        .getByRole('button', { name: `Edit ${habit}`, exact: true })
        .locator('visible=true');
      await expect(edit).toBeVisible();
      await settle(page);

      await expectNoShift(page, 'opening the dialog', () => edit.click());
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByLabel('Name')).toBeVisible();
      const opened = await dialog.boundingBox();

      await expectNoShift(page, 'the Stats tab', () =>
        dialog.getByRole('tab', { name: 'Stats' }).click(),
      );
      expect(await dialog.boundingBox()).toEqual(opened);

      await expectNoShift(page, 'the Edit tab', () =>
        dialog.getByRole('tab', { name: 'Edit' }).click(),
      );
      expect(await dialog.boundingBox()).toEqual(opened);
    });

    test('moves between months with the calendar and chart in place', async ({
      page,
    }) => {
      await page.goto('/progress');
      await expect(
        page.getByRole('heading', { name: 'Daily completion' }),
      ).toBeVisible();
      await settle(page);

      // A year back, which crosses months of five and six weeks whatever
      // today's date, then back to this one.
      for (const month of [
        ...Array<string>(12).fill('Previous month'),
        'This month',
      ]) {
        await expectNoShift(page, month, () =>
          page.getByRole('button', { name: month }).click(),
        );
      }
    });
  });
}

test.describe('on a small phone', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  let habit = '';

  test.beforeAll(async ({ browser }, testInfo) => {
    habit = await seedHabit(browser, testInfo, 'Steady small phone');
  });

  test("centers the last row of the day's habits", async ({ page }) => {
    await page.goto('/');
    const list = page.getByLabel('List of daily habits');
    await expect(markButton(page, habit)).toBeVisible();
    await page.waitForTimeout(SETTLE_MS);

    const { left, right } = await list.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const items = Array.from(element.children).map((item) =>
        item.getBoundingClientRect(),
      );
      const lastTop = Math.max(...items.map((item) => Math.round(item.top)));
      const lastRow = items.filter((item) => Math.round(item.top) === lastTop);
      return {
        left: Math.min(...lastRow.map((item) => item.left)) - box.left,
        right: box.right - Math.max(...lastRow.map((item) => item.right)),
      };
    });
    expect(Math.abs(left - right)).toBeLessThanOrEqual(2);
  });

  test("fits each day's name and date between the arrows", async ({ page }) => {
    await page.goto('/');
    const previous = page.getByRole('button', { name: 'Previous Date' });
    const next = page.getByRole('button', { name: 'Next Date' });
    await expect(previous).toBeVisible();

    // A week ahead covers every day name, "Wednesday" the longest.
    for (let day = 0; day < 7; day++) {
      await next.click();
      // The pill around the day's name and date: its text may not spill
      // past it, onto the arrows.
      const pill = page.getByRole('heading', { level: 2 }).locator('..');
      const overflow = await pill.evaluate(
        (element) => element.scrollWidth - element.clientWidth,
      );
      expect(overflow, (await pill.textContent()) ?? '').toBeLessThanOrEqual(0);

      // And the text itself sits clear of both arrows.
      const text = await pill.evaluate((element) => {
        const boxes = Array.from(element.children).map((child) =>
          child.getBoundingClientRect(),
        );
        return {
          left: Math.min(...boxes.map((box) => box.left)),
          right: Math.max(...boxes.map((box) => box.right)),
        };
      });
      const [left, right] = await Promise.all([
        previous.boundingBox(),
        next.boundingBox(),
      ]);
      if (!left || !right) throw new Error('The arrows did not render');
      expect(text.left).toBeGreaterThanOrEqual(left.x + left.width);
      expect(text.right).toBeLessThanOrEqual(right.x);
    }
  });
});
