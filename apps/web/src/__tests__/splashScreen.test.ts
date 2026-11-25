// Checks the launch splash: drawn in index.html before any script, the app icon's ring closing around its check,
// with an iOS launch image for each device and the same emerald for Android's splash.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  pixelAt,
  pngColourType,
  pngSize,
  topLeftPixel,
} from '@testing/pngImage';

const WEB_ROOT = path.resolve(__dirname, '../..');
const PUBLIC = path.join(WEB_ROOT, 'public');

const html = readFileSync(path.join(WEB_ROOT, 'index.html'), 'utf8');
const appIcon = readFileSync(
  path.join(PUBLIC, 'icons/favicon.svg'),
  'utf8',
).toLowerCase();

/** The app icon's solid background colour, as `#rrggbb`. */
const ICON_EMERALD =
  /<rect [^>]*fill="(#[0-9a-f]{6})"/.exec(appIcon)?.[1] ?? 'missing';

/** The stops of the gradient with the given id in some SVG source, in order. */
function gradientStops(source: string, id: string): string[] {
  const gradient = new RegExp(
    `<(linear|radial)gradient\\s+id="${id}"[^>]*>([\\s\\S]*?)</\\1gradient>`,
    'i',
  ).exec(source);
  expect(gradient, `gradient #${id}`).not.toBeNull();
  return [
    ...(gradient?.[2] ?? '').matchAll(/stop-color="(#[0-9a-f]{6})"/gi),
  ].map((match) => match[1].toLowerCase());
}

/** The declarations of the first rule for `selector` in index.html's style. */
function rule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(html);
  expect(match, selector).not.toBeNull();
  return match?.[1] ?? '';
}

describe('the launch splash in index.html', () => {
  it('sits outside the React root, so it shows before any script and stays put while React starts', () => {
    const splash = html.indexOf('<div id="splash"');
    expect(splash).toBeGreaterThan(-1);
    expect(splash).toBeLessThan(html.indexOf('<div id="root">'));
  });

  // A script in <head> stops the parser until it has loaded, so the splash
  // comes first. It looks the same in every theme; only the app behind it,
  // which renders after the theme script has run, needs the theme.
  it('paints before the theme script, which runs before the app renders', () => {
    const splash = html.indexOf('<div id="splash"');
    const themeScript = html.indexOf('<script src="/applyStoredTheme.js">');
    expect(themeScript).toBeGreaterThan(splash);
    expect(themeScript).toBeLessThan(html.indexOf('<div id="root">'));
  });

  it('stays hidden in a browser tab', () => {
    expect(rule('#splash')).toMatch(/display:\s*none/);
  });

  // The home screen opens the app in its own window (display-mode:
  // standalone). A touch screen tells a phone or tablet from a desktop,
  // whose installed app opens straight to the page.
  it("shows only in an app opened from a phone or tablet's home screen", () => {
    const installed =
      /@media \(display-mode: standalone\) and \(pointer: coarse\)\s*\{([\s\S]*?)\n {6}\}/.exec(
        html,
      );
    expect(installed, 'home screen app block').not.toBeNull();
    expect(installed?.[1]).toMatch(/#splash\s*\{\s*display:\s*grid;\s*\}/);
  });

  it('tells assistive technology the app is loading', () => {
    expect(html).toMatch(
      /<div id="splash"[^>]*role="status"[^>]*aria-label="Loading Track N(&apos;|')? Stick"/,
    );
  });

  it("fills the screen with the app icon's emerald", () => {
    expect(rule('#splash')).toMatch(/position:\s*fixed/);
    expect(rule('#splash')).toMatch(/inset:\s*0/);
    expect(rule('#splash').toLowerCase()).toContain(
      `background: ${ICON_EMERALD}`,
    );
  });

  // iOS paints the status bar and the home indicator's strip from the page's
  // own background and theme-color, not from the fixed splash, so those turn
  // emerald too while it shows.
  it("paints the page's edges emerald while it shows in a home screen app", () => {
    const installed =
      /@media \(display-mode: standalone\) and \(pointer: coarse\)\s*\{([\s\S]*?)\n {6}\}/.exec(
        html,
      );
    const edges =
      /html:has\(#splash:not\(\.splash-done\)\),\s*html:has\(#splash:not\(\.splash-done\)\) body\s*\{([^}]*)\}/.exec(
        installed?.[1] ?? '',
      );
    expect(edges, 'edges rule').not.toBeNull();
    expect(edges?.[1].toLowerCase()).toContain(`background: ${ICON_EMERALD}`);
  });

  it("tints the system's chrome emerald in a home screen app, ahead of the theme's colour", () => {
    const metas = [...html.matchAll(/<meta\s+name="theme-color"[^>]*>/g)].map(
      (match) => match[0],
    );
    expect(metas).toHaveLength(2);
    // The first theme-color whose media matches is the one the system uses.
    expect(metas[0]).toContain('id="splash-theme-color"');
    expect(metas[0].toLowerCase()).toContain(`content="${ICON_EMERALD}"`);
    expect(metas[0]).toContain(
      'media="(display-mode: standalone) and (pointer: coarse)"',
    );
    expect(metas[1]).not.toContain('media=');
  });

  it("draws one circle, the app icon's ring, closing around its check", () => {
    const medallion =
      /<svg\s+class="splash-medallion"[\s\S]*?<\/svg>/.exec(html)?.[0] ?? '';
    expect(medallion, 'medallion').not.toBe('');
    // The ring is a path, so that it can sweep closed; no filled dial.
    expect(medallion).not.toMatch(/<circle/);
    expect(medallion.match(/<path\b/g)).toHaveLength(2);
    expect(medallion).toMatch(/<path\s+class="splash-ring"/);
    expect(medallion).toMatch(/<path\s+class="splash-check"/);
    for (const part of ['ring', 'check']) {
      expect(gradientStops(html, `splash-${part}`), part).toEqual(
        gradientStops(appIcon, part),
      );
    }
  });

  it('draws the check in once the ring has closed', () => {
    /** The duration and delay, in seconds, of the part's draw animation. */
    const draw = (part: string) => {
      const match = new RegExp(
        `\\.splash-${part}\\s*\\{[^}]*?animation:\\s*splash-draw\\s+([\\d.]+)s[^;]*?\\s([\\d.]+)s\\s+forwards`,
      ).exec(html);
      expect(match, part).not.toBeNull();
      return { duration: Number(match?.[1]), delay: Number(match?.[2]) };
    };
    // In milliseconds, clear of floating point's rounding.
    const ring = draw('ring');
    expect(Math.round(draw('check').delay * 1000)).toBeGreaterThanOrEqual(
      Math.round((ring.delay + ring.duration) * 1000),
    );
  });

  it('writes the name beneath the medallion', () => {
    expect(html).toMatch(
      /class="splash-wordmark"[^>]*>Track N(&apos;|') Stick</,
    );
  });

  it('holds still for people who ask for reduced motion', () => {
    const reduced =
      /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n {6}\}/.exec(
        html,
      );
    expect(reduced, 'reduced motion block').not.toBeNull();
    expect(reduced?.[1]).toContain('animation: none');
  });

  it('fades out without catching taps once the app is ready', () => {
    const done = rule('#splash.splash-done');
    expect(done).toMatch(/opacity:\s*0/);
    expect(done).toMatch(/pointer-events:\s*none/);
  });
});

/** A launch image link: its file and the screen its media query names. */
interface LaunchImage {
  href: string;
  width: number;
  height: number;
  ratio: number;
  orientation: 'portrait' | 'landscape';
}

const launchImages: LaunchImage[] = [
  ...html.matchAll(
    /<link\s+rel="apple-touch-startup-image"\s+media="([^"]+)"\s+href="([^"]+)"/g,
  ),
].map(([, media, href]) => {
  const number = (name: string) =>
    Number(new RegExp(`${name}: ([\\d.]+)`).exec(media)?.[1]);
  return {
    href,
    width: number('device-width'),
    height: number('device-height'),
    ratio: number('-webkit-device-pixel-ratio'),
    orientation: media.includes('orientation: landscape')
      ? 'landscape'
      : 'portrait',
  };
});

describe('the iOS launch images', () => {
  it.each([
    [440, 956, 3],
    [430, 932, 3],
    [402, 874, 3],
    [393, 852, 3],
    [390, 844, 3],
    [375, 812, 3],
    [375, 667, 2],
  ])('cover the %ix%i point iPhone at %ix', (width, height, ratio) => {
    expect(launchImages).toContainEqual(
      expect.objectContaining({
        width,
        height,
        ratio,
        orientation: 'portrait',
      }),
    );
  });

  it('cover iPads in both orientations', () => {
    const iPads = launchImages.filter((image) => image.width >= 744);
    expect(iPads.length).toBeGreaterThan(0);
    for (const { width, height, ratio } of iPads) {
      for (const orientation of ['portrait', 'landscape']) {
        expect(launchImages).toContainEqual(
          expect.objectContaining({ width, height, ratio, orientation }),
        );
      }
    }
  });

  it('are each the size of the screen they name, in its orientation', () => {
    for (const image of launchImages) {
      const file = path.join(PUBLIC, image.href);
      expect(existsSync(file), image.href).toBe(true);
      const [short, long] = [image.width, image.height].map(
        (points) => points * image.ratio,
      );
      expect(pngSize(file), image.href).toBe(
        image.orientation === 'portrait'
          ? `${short}x${long}`
          : `${long}x${short}`,
      );
    }
  });

  it("are opaque and fill the screen with the app icon's emerald", () => {
    for (const image of launchImages) {
      const file = path.join(PUBLIC, image.href);
      expect(pngColourType(file), image.href).toBe(2);
      const hex = topLeftPixel(file)
        .map((channel) => channel.toString(16).padStart(2, '0'))
        .join('');
      expect(`#${hex}`, image.href).toBe(ICON_EMERALD);
    }
  });

  // The splash's ring sweeps closed there, from nothing.
  it('leave the middle of the screen empty, for the splash to draw its ring in', () => {
    for (const image of launchImages) {
      const file = path.join(PUBLIC, image.href);
      const [width, height] = pngSize(file).split('x').map(Number);
      const hex = pixelAt(file, Math.floor(width / 2), Math.floor(height / 2))
        .map((channel) => channel.toString(16).padStart(2, '0'))
        .join('');
      expect(`#${hex}`, image.href).toBe(ICON_EMERALD);
    }
  });
});

describe('the Android splash', () => {
  const manifest = JSON.parse(
    readFileSync(path.join(PUBLIC, 'manifest.json'), 'utf8'),
  ) as { background_color: string; theme_color: string };

  it("uses the app icon's emerald, leading into the in-app splash", () => {
    expect(manifest.background_color.toLowerCase()).toBe(ICON_EMERALD);
    expect(manifest.theme_color.toLowerCase()).toBe(ICON_EMERALD);
  });
});
