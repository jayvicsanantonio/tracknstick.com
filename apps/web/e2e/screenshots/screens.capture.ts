// Captures each screen of the web app in light and dark, at desktop and phone sizes.
// Signs in as the Clerk test user against a fresh local database and seeds sample habits.

import { clerk, clerkSetup } from '@clerk/testing/playwright';
import {
  expect,
  test,
  type Browser,
  type BrowserContextOptions,
  type Locator,
  type Page,
} from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Where the PNGs go: OUT_DIR/<screen>/<LABEL>--<device>-<theme>.png, where
// LABEL is "before" or "after".
const OUT_DIR = process.env.OUT_DIR ?? '';
const LABEL = process.env.LABEL ?? 'after';
const AUTH_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../.auth/capture.json',
);

const DEVICES = {
  desktop: { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 },
  wide: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 },
  tablet: {
    viewport: { width: 768, height: 1024 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  },
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
} satisfies Record<string, BrowserContextOptions>;

interface Combo {
  device: keyof typeof DEVICES;
  theme: 'light' | 'dark';
}

const COMBOS: Combo[] = [
  { device: 'desktop', theme: 'light' },
  { device: 'desktop', theme: 'dark' },
  { device: 'mobile', theme: 'light' },
  { device: 'mobile', theme: 'dark' },
  // Tablet and wide desktop in light only, to keep the image count down.
  { device: 'tablet', theme: 'light' },
  { device: 'wide', theme: 'light' },
];

const EVERY_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HABITS: [name: string, icon: string, days: string[]][] = [
  ['Morning run', 'Footprints', EVERY_DAY],
  ['Read 20 pages', 'BookOpen', EVERY_DAY],
  ['Drink water', 'GlassWater', EVERY_DAY],
  ['Meditate', 'Brain', EVERY_DAY],
  ['Practice guitar', 'Guitar', EVERY_DAY],
  ['Swim', 'Droplet', threeDaysFromToday()],
];

/**
 * Three days a week, today among them, so the habit is due on the day the
 * screens are captured: a fixed Mon/Wed/Fri left it off the Tracker on
 * other days.
 */
function threeDaysFromToday(): string[] {
  const today = new Date().getDay();
  return [0, 2, 4].map((offset) => EVERY_DAY[(today + offset) % 7]);
}

async function open(browser: Browser, combo: Combo, signedIn: boolean) {
  const context = await browser.newContext({
    ...DEVICES[combo.device],
    storageState: signedIn ? AUTH_FILE : undefined,
  });
  await context.addInitScript((theme) => {
    localStorage.setItem('track-n-stick-theme', theme);
  }, combo.theme);
  return { context, page: await context.newPage() };
}

// Phone and tablet shots show one screen, as the device does: a full-page
// stitch would draw fixed bars (such as the tab bar) in the middle
// of the image. Desktop and wide shots are full-page.
async function shot(page: Page, screen: string, combo: Combo, fullPage = true) {
  // Lets entrance animations and the chart's bar animation finish.
  await page.waitForTimeout(2200);
  await page.screenshot({
    path: path.join(
      OUT_DIR,
      screen,
      `${LABEL}--${combo.device}-${combo.theme}.png`,
    ),
    fullPage:
      fullPage && (combo.device === 'desktop' || combo.device === 'wide'),
  });
}

async function eachCombo(
  browser: Browser,
  signedIn: boolean,
  capture: (page: Page, combo: Combo) => Promise<void>,
) {
  for (const combo of COMBOS) {
    const { context, page } = await open(browser, combo, signedIn);
    await capture(page, combo);
    await context.close();
    // The local API rate-limits habit requests per minute; spacing the
    // combinations out keeps rate-limit errors out of the screenshots.
    await new Promise((resolve) => setTimeout(resolve, 20_000));
  }
}

/**
 * Marks each habit complete and waits until the API has saved it, then checks
 * after a reload that `total` habits are done. A failed save is undone in the
 * page, so without this the screenshots could quietly show fewer completed
 * habits than they should.
 */
async function completeHabits(page: Page, names: string[], total: number) {
  for (const name of names) {
    const saved = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /\/api\/v1\/habits\/[^/]+\/trackers$/.test(
          new URL(response.url()).pathname,
        ),
    );
    await page
      .getByRole('button', { name: `Mark ${name} as complete` })
      .click();
    const response = await saved;
    expect(
      response.ok(),
      `Saving "${name}" as complete failed: ${response.status()}`,
    ).toBe(true);
  }
  await page.reload();
  await expect(
    page.getByRole('button', { name: /^Mark .+ as incomplete$/ }),
  ).toHaveCount(total);
}

// The Add dialog's submit button reads "Add habit" now and "Save Changes"
// before, so the same script captures either version of the app.
const submitButton = (dialog: Locator) =>
  dialog.getByRole('button', { name: /^(Add habit|Save Changes)$/ });

test('capture every screen', async ({ browser }) => {
  if (!OUT_DIR) throw new Error('Set OUT_DIR to the folder for the PNGs.');
  const emailAddress = process.env.E2E_CLERK_USER_EMAIL;
  if (!emailAddress) throw new Error('E2E_CLERK_USER_EMAIL is not set.');

  await clerkSetup();
  {
    const page = await browser.newPage();
    await page.goto('/');
    await clerk.signIn({ page, emailAddress });
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: 'Add Habit', exact: true }).first(),
    ).toBeAttached();
    await page.context().storageState({ path: AUTH_FILE });
    await page.close();
  }

  await eachCombo(browser, false, async (page, combo) => {
    await page.goto('/');
    await shot(page, '01-welcome', combo);
  });

  await eachCombo(browser, true, async (page, combo) => {
    await page.goto('/');
    await shot(page, '02-tracker-empty', combo);
    await page
      .getByRole('button', { name: 'Add Habit', exact: true })
      .filter({ visible: true })
      .click();
    await shot(page, '03-add-habit-dialog', combo, false);
  });

  // Seeds the habits once, then completes two of them today. Waits first for
  // the API's per-minute habits rate limit to reset, and spaces out the adds:
  // each one refreshes the habit lists.
  await new Promise((resolve) => setTimeout(resolve, 60_000));
  {
    const { context, page } = await open(browser, COMBOS[0], true);
    await page.goto('/');
    for (const [name, icon, days] of HABITS) {
      await page
        .getByRole('button', { name: 'Add Habit', exact: true })
        .filter({ visible: true })
        .click();
      const dialog = page.getByRole('dialog', { name: 'Add New Habit' });
      await dialog.getByLabel('Name').fill(name);
      // Icons are named in plain words ("Glass water") now, by their key
      // ("GlassWater") before; match either so both versions capture.
      const plain = icon.replace(/([a-z])([A-Z])/g, '$1 $2');
      const radio = page.getByRole('radio', {
        name: new RegExp(`^(${icon}|${plain})$`, 'i'),
      });
      await dialog.locator('label', { has: radio }).click();
      for (const day of days) {
        await dialog.getByRole('button', { name: day, exact: true }).click();
      }
      await submitButton(dialog).click();
      await expect(dialog).toBeHidden();
      await page.waitForTimeout(3000);
    }
    await completeHabits(page, ['Morning run', 'Read 20 pages'], 2);
    await context.close();
  }
  // Seeding used up much of the minute's habit requests; let the limit reset
  // before the screens that load habits.
  await new Promise((resolve) => setTimeout(resolve, 60_000));

  await eachCombo(browser, true, async (page, combo) => {
    await page.goto('/');
    await shot(page, '04-tracker', combo);
    // The coach is the Coach page, linked from the header and the phone tab
    // bar. Earlier layouts opened a chat panel from a button instead.
    await page
      .getByRole('link', { name: /^(Coach|Habit Coach)$/ })
      .or(page.getByRole('button', { name: /^(Open chat|Coach)$/ }))
      .filter({ visible: true })
      .first()
      .click();
    await shot(page, '05-chat', combo, false);

    // The day before: none of the seeded habits had started yet.
    await page.goto('/');
    await page.getByRole('button', { name: 'Previous Date' }).click();
    await shot(page, '14-tracker-other-day', combo);

    await page.goto('/habits');
    await shot(page, '06-habits', combo);
    await page
      .getByRole('button', { name: 'Edit Morning run' })
      .filter({ visible: true })
      .click();
    await shot(page, '07-edit-habit-dialog', combo, false);
    await page.getByRole('tab', { name: 'Stats' }).click();
    await shot(page, '15-edit-habit-stats', combo, false);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await page
      .getByRole('button', { name: 'Delete Swim' })
      .filter({ visible: true })
      .click();
    await shot(page, '08-delete-habit-dialog', combo, false);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('alertdialog')).toBeHidden();
    await page.getByRole('tab', { name: 'Archived' }).click();
    await shot(page, '16-habits-archived-empty', combo);

    await page.goto('/progress');
    await shot(page, '09-progress-history', combo);
    // Earlier layouts put the chart and achievements behind tabs; the
    // current one shows them together and opens the full achievement list
    // from a button.
    const chartTab = page.getByRole('tab', { name: /Completion Rate/ });
    if ((await chartTab.count()) > 0) {
      await chartTab.click();
      await shot(page, '10-progress-chart', combo);
      await page.getByRole('tab', { name: /Achievements/ }).click();
    } else {
      await page.getByRole('button', { name: 'See all achievements' }).click();
    }
    await shot(page, '11-progress-achievements', combo, false);

    await page.goto('/no-such-page');
    await shot(page, '12-not-found', combo);
  });

  // Completes the rest, for the all-done state.
  {
    const { context, page } = await open(browser, COMBOS[0], true);
    await page.goto('/');
    await completeHabits(
      page,
      HABITS.slice(2).map(([name]) => name),
      HABITS.length,
    );
    await context.close();
  }
  await eachCombo(browser, true, async (page, combo) => {
    await page.goto('/');
    await shot(page, '13-tracker-all-done', combo);
  });
});
