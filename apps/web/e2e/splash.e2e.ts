// End-to-end checks of the launch splash in an app opened from a phone's home screen: it paints before any
// script, at the centre of the screen, plays its ring closed and its check in, then fades onto the finished page.

// The scripts below that run in the page use the browser's types.
/// <reference lib="dom" />

import { expect, test, type Page } from '@playwright/test';

const splash = (page: Page) =>
  page.getByRole('status', { name: "Loading Track N' Stick" });

/** What was on screen as the splash began to fade, and what moved after. */
interface Fade {
  /**
   * The splash's drawing animations still playing: not its endless breath,
   * nor the fade's own transition.
   */
  playing: number;
  /** The loading states on the page, by their accessible name. */
  loading: string[];
  /** The text of the page beneath. */
  page: string;
  /** Loading states that showed up once the fade had begun. */
  loadingAfter: string[];
  /** Layout shifts once the fade had begun: each moved element's boxes. */
  shiftsAfter: string[];
}

/** Records, from the page's first paint, what the splash fades onto. */
async function recordFade(page: Page) {
  await page.addInitScript(() => {
    const loading = () =>
      Array.from(document.querySelectorAll('[role="status"]'))
        .filter((status) => status.id !== 'splash')
        .map((status) => status.getAttribute('aria-label') ?? '?');
    let fade: Fade | null = null;
    (window as unknown as { __fade: () => Fade | null }).__fade = () => fade;

    new MutationObserver(() => {
      const splash = document.getElementById('splash');
      if (!fade && splash?.classList.contains('splash-done')) {
        fade = {
          playing: splash
            .getAnimations({ subtree: true })
            .filter(
              (animation) =>
                animation instanceof CSSAnimation &&
                animation.playState === 'running' &&
                animation.effect?.getComputedTiming().endTime !== Infinity,
            ).length,
          loading: loading(),
          page: document.querySelector('main')?.textContent ?? '',
          loadingAfter: [],
          shiftsAfter: [],
        };
      } else if (fade) {
        fade.loadingAfter.push(...loading());
      }
    }).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    new PerformanceObserver((list) => {
      if (!fade) return;
      for (const entry of list.getEntries() as unknown as {
        sources?: {
          node: Node | null;
          previousRect: DOMRectReadOnly;
          currentRect: DOMRectReadOnly;
        }[];
      }[]) {
        for (const source of entry.sources ?? []) {
          const box = (rect: DOMRectReadOnly) =>
            `${Math.round(rect.x)},${Math.round(rect.y)} ${Math.round(rect.width)}×${Math.round(rect.height)}`;
          fade.shiftsAfter.push(
            `${source.node?.nodeName ?? '?'} ${box(source.previousRect)} -> ${box(source.currentRect)}`,
          );
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

/** Waits for the splash to leave the page, then reads what it faded onto. */
async function readFade(page: Page): Promise<Fade> {
  await expect(page.locator('#splash')).toHaveCount(0, { timeout: 15_000 });
  // Long enough for the page's own entrance animations to finish.
  await page.waitForTimeout(1000);
  const fade = await page.evaluate(() =>
    (window as unknown as { __fade: () => Fade | null }).__fade(),
  );
  expect(fade, 'the splash faded').not.toBeNull();
  return fade!;
}

/** Holds the app's script back, as a slow connection would, until released. */
async function holdAppScript(page: import('@playwright/test').Page) {
  let release = () => undefined as void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/src/main.tsx', async (route) => {
    await held;
    await route.continue();
  });
  return release;
}

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  // Opens every page the way the home screen opens the installed app, in
  // display-mode: standalone. Chromium has no emulation for it, only this
  // setting, whose 3 is blink::mojom::DisplayMode::kStandalone.
  launchOptions: { args: ['--blink-settings=displayModeOverride=3'] },
});

test('paints the splash before any script runs, at the centre of the screen', async ({
  page,
}) => {
  const release = await holdAppScript(page);

  // 'commit': the page's own events wait for its scripts, which are held.
  await page.goto('/', { waitUntil: 'commit' });

  await expect(splash(page)).toBeVisible();
  await expect(page.getByText("Track N' Stick", { exact: true })).toBeVisible();
  const viewport = page.viewportSize();
  const medallion = await page.locator('#splash svg').boundingBox();
  expect(medallion).not.toBeNull();
  if (viewport && medallion) {
    expect(medallion.x + medallion.width / 2).toBeCloseTo(
      viewport.width / 2,
      0,
    );
    expect(medallion.y + medallion.height / 2).toBeCloseTo(
      viewport.height / 2,
      0,
    );
  }

  release();
});

test('gives way to the app once it is ready', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('button', { name: 'Add Habit', exact: true }),
  ).toBeVisible();
  await expect(page.locator('#splash')).toHaveCount(0);
});

test('plays its ring closed and its check in, then fades straight onto the finished tracker', async ({
  page,
}) => {
  await recordFade(page);
  await page.goto('/');
  const fade = await readFade(page);

  expect(fade.playing, 'splash animations still playing').toBe(0);
  expect(fade.loading, 'loading states under the fade').toEqual([]);
  expect(fade.page).toContain('Today');
  expect(fade.loadingAfter, 'loading states after the fade').toEqual([]);
  expect(fade.shiftsAfter, 'layout shifts after the fade').toEqual([]);
});

test.describe('signed out', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('plays its ring closed and its check in, then fades straight onto the welcome page', async ({
    page,
  }) => {
    await recordFade(page);
    await page.goto('/');
    const fade = await readFade(page);

    expect(fade.playing, 'splash animations still playing').toBe(0);
    expect(fade.loading, 'loading states under the fade').toEqual([]);
    expect(fade.page).toContain('Get started');
    expect(fade.loadingAfter, 'loading states after the fade').toEqual([]);
    expect(fade.shiftsAfter, 'layout shifts after the fade').toEqual([]);
  });
});

test.describe('installed on a desktop', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    hasTouch: false,
    isMobile: false,
  });

  test('opens straight to the page, without the splash', async ({ page }) => {
    const release = await holdAppScript(page);

    await page.goto('/', { waitUntil: 'commit' });

    await expect(page.locator('#splash')).toBeAttached();
    await expect(page.locator('#splash')).toBeHidden();

    release();
  });
});
