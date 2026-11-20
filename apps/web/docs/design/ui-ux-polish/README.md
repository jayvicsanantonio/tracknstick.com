# UI/UX polish: before and after

Every screen of the web app before and after the UI/UX polish. Each screen is
shown at desktop (1280×860) and phone (390×844, the iPhone 12–14 size) widths in
light and dark, and at tablet (768×1024) and wide desktop (1920×1080) widths in
light. **Before** is `main` at `c6e398a`; **after** is the `polish/ui-ux`
branch.

Desktop and wide shots are full-page. Phone and tablet shots show one screen, as
the device does: a full-page stitch would draw the fixed tab bar and chat button
in the middle of the image.

## What changed, in short

**Look and feel**

- **Plus Jakarta Sans** replaces the system font. It is self-hosted from
  `@fontsource-variable/plus-jakarta-sans`, so the Content-Security-Policy needs
  no third-party host, and the service worker precaches it for offline use.
- On screens 1536px and wider, content may grow to 1440px instead of stopping at
  1280px.
- The Tracker becomes a **two-column dashboard** from 1024px, with a "2 of 6
  done" summary under the progress ring.
- The welcome page gets a **richer hero**: feature highlights and an illustrated
  preview of the tracker.
- Completed habits are unmistakable: solid fill and a check badge.
- Empty lists explain themselves and offer the next step.

**Phones**

- A **bottom tab bar** replaces the crowded header navigation: Tracker, Habits,
  Add, Progress and the habit Coach, in thumb reach. See
  [`MobileTabBar.tsx`](../../../src/features/layout/components/MobileTabBar.tsx).
- The Add and Edit habit dialogs open as **bottom sheets** with their buttons
  pinned to the bottom. See
  [`HabitDialog.tsx`](../../../src/features/habits/components/HabitDialog.tsx).
- The habits table becomes a **card list**.
- Tap targets are 44px (Apple's guideline): icon buttons, the tab bar, card
  actions and chat controls. The day buttons are 40px, so all seven fit in a row
  with space between them.
- Safe-area insets (`viewport-fit=cover`) keep the header, tab bar, sheets,
  chat, toasts and the install prompt clear of the notch and the home indicator.
  The install prompt sits above the tab bar.
- Denser layouts and text that fits: three habit columns, two-line habit names,
  a compact date, short tab labels.

**Fixes**

- A day with no habits due no longer says "No habits yet".
- The habit coach panel was see-through; it is opaque and themed.
- Light-mode secondary text meets WCAG AA (4.5:1); dark-mode destructive actions
  are red. [`palette.test.ts`](../../../src/styles/__tests__/palette.test.ts)
  checks both.
- The calendar no longer shows future days as "0%"; the chart's axis is fixed at
  0–100%; counts read "1 day", not "1 days".
- On desktop, toasts stack above the chat button instead of covering it.
- Earned achievements and the 404 page use the app's palette.

## How these were made

[`e2e/screenshots/screens.capture.ts`](../../../e2e/screenshots/screens.capture.ts)
starts the local API on a fresh database, signs in as the e2e Clerk test user,
seeds six habits (two completed), and captures every screen in each size and
theme. It needs the same keys and test user as the e2e run (see
[`e2e/README.md`](../../../e2e/README.md)). From `apps/web`:

```bash
OUT_DIR=$PWD/docs/design/ui-ux-polish/screens LABEL=after pnpm screenshots
```

For the before set, point `WEB_DIR` at another checkout's `apps/web`, such as a
worktree of `main`, and set `LABEL=before`. A run takes about 15 minutes: it
pauses between sizes to stay under the local API's per-minute rate limit.

## Known gaps

- `--color-brand-primary` as small text, such as the date beside "Today", is
  3.6:1 in light mode. It is also the brand's main fill, so darkening it changes
  the look everywhere; left as a design decision.
- These shots were taken before the Progress date fix (#161) was merged, so the
  completion chart in them labels each bar one day early, as it did in timezones
  west of UTC. The app now shows the right day.

## Screens

### Welcome (signed out)

`/` before sign-in

- A **richer hero**: a "Habit tracker + AI coach" badge, a larger headline,
  three feature highlights (Check in daily, See your progress, Ask the coach)
  and, from 1024px, a small illustrated preview of the tracker.
- Hero and sign-in sit side by side from 1024px; on tablets they stack, where
  the old side-by-side layout squeezed the tagline to a word or two per line.
- On phones the features show as a compact row of three, so sign-in stays close.
- The header shows the **Track N' Stick** name on phones too.
- The footer's Privacy and Terms links, which pointed at `#`, are gone.

|                       | Before                                                                                                                         | After                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Desktop (1280), light | <img src="screens/01-welcome/before--desktop-light.png" width="420" alt="Welcome (signed out), desktop (1280), light, before"> | <img src="screens/01-welcome/after--desktop-light.png" width="420" alt="Welcome (signed out), desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/01-welcome/before--desktop-dark.png" width="420" alt="Welcome (signed out), desktop (1280), dark, before">   | <img src="screens/01-welcome/after--desktop-dark.png" width="420" alt="Welcome (signed out), desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/01-welcome/before--mobile-light.png" width="260" alt="Welcome (signed out), phone (390), light, before">     | <img src="screens/01-welcome/after--mobile-light.png" width="260" alt="Welcome (signed out), phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/01-welcome/before--mobile-dark.png" width="260" alt="Welcome (signed out), phone (390), dark, before">       | <img src="screens/01-welcome/after--mobile-dark.png" width="260" alt="Welcome (signed out), phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/01-welcome/before--tablet-light.png" width="320" alt="Welcome (signed out), tablet (768), light, before">    | <img src="screens/01-welcome/after--tablet-light.png" width="320" alt="Welcome (signed out), tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/01-welcome/before--wide-light.png" width="420" alt="Welcome (signed out), wide (1920), light, before">       | <img src="screens/01-welcome/after--wide-light.png" width="420" alt="Welcome (signed out), wide (1920), light, after">       |

### Tracker, no habits yet

`/`

- Phones get the **bottom tab bar**: Tracker, Habits, a raised **Add** button,
  Progress and Coach, each at least 44px and within thumb reach.
- The phone header keeps only the brand name, the theme toggle and the account
  button, each 44px.
- From 1024px the header's navigation shows text labels (Tracker, Habits,
  Progress), and Habits uses a checklist icon instead of a pencil.

|                       | Before                                                                                                                                 | After                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Desktop (1280), light | <img src="screens/02-tracker-empty/before--desktop-light.png" width="420" alt="Tracker, no habits yet, desktop (1280), light, before"> | <img src="screens/02-tracker-empty/after--desktop-light.png" width="420" alt="Tracker, no habits yet, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/02-tracker-empty/before--desktop-dark.png" width="420" alt="Tracker, no habits yet, desktop (1280), dark, before">   | <img src="screens/02-tracker-empty/after--desktop-dark.png" width="420" alt="Tracker, no habits yet, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/02-tracker-empty/before--mobile-light.png" width="260" alt="Tracker, no habits yet, phone (390), light, before">     | <img src="screens/02-tracker-empty/after--mobile-light.png" width="260" alt="Tracker, no habits yet, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/02-tracker-empty/before--mobile-dark.png" width="260" alt="Tracker, no habits yet, phone (390), dark, before">       | <img src="screens/02-tracker-empty/after--mobile-dark.png" width="260" alt="Tracker, no habits yet, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/02-tracker-empty/before--tablet-light.png" width="320" alt="Tracker, no habits yet, tablet (768), light, before">    | <img src="screens/02-tracker-empty/after--tablet-light.png" width="320" alt="Tracker, no habits yet, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/02-tracker-empty/before--wide-light.png" width="420" alt="Tracker, no habits yet, wide (1920), light, before">       | <img src="screens/02-tracker-empty/after--wide-light.png" width="420" alt="Tracker, no habits yet, wide (1920), light, after">       |

### Add habit

`/`, Add Habit

- On phones the dialog is a **bottom sheet**: full width, anchored to the bottom
  edge, sliding up, with a grab handle.
- **Cancel** and **Add habit** are pinned to the bottom of the sheet, clear of
  the iPhone home indicator.
- The submit button says **Add habit** ("Adding…" while saving) instead of "Save
  Changes".
- Larger touch targets on phones: a 44px close button, 40px day buttons spread
  across the row, and a 6-column icon grid with bigger cells.
- The close button no longer shows a focus ring as soon as the dialog opens.

|                       | Before                                                                                                                       | After                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Desktop (1280), light | <img src="screens/03-add-habit-dialog/before--desktop-light.png" width="420" alt="Add habit, desktop (1280), light, before"> | <img src="screens/03-add-habit-dialog/after--desktop-light.png" width="420" alt="Add habit, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/03-add-habit-dialog/before--desktop-dark.png" width="420" alt="Add habit, desktop (1280), dark, before">   | <img src="screens/03-add-habit-dialog/after--desktop-dark.png" width="420" alt="Add habit, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/03-add-habit-dialog/before--mobile-light.png" width="260" alt="Add habit, phone (390), light, before">     | <img src="screens/03-add-habit-dialog/after--mobile-light.png" width="260" alt="Add habit, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/03-add-habit-dialog/before--mobile-dark.png" width="260" alt="Add habit, phone (390), dark, before">       | <img src="screens/03-add-habit-dialog/after--mobile-dark.png" width="260" alt="Add habit, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/03-add-habit-dialog/before--tablet-light.png" width="320" alt="Add habit, tablet (768), light, before">    | <img src="screens/03-add-habit-dialog/after--tablet-light.png" width="320" alt="Add habit, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/03-add-habit-dialog/before--wide-light.png" width="420" alt="Add habit, wide (1920), light, before">       | <img src="screens/03-add-habit-dialog/after--wide-light.png" width="420" alt="Add habit, wide (1920), light, after">       |

### Tracker

`/`

- From 1024px the Tracker is a **two-column dashboard**: the day, its progress
  ring and a summary on the left, the habits on the right. Below that the parts
  stack.
- A **summary** under the ring: "2 of 6 done · 4 to go", or "All 6 done · nice
  work".
- A completed habit has a **solid fill, a contrasting icon and a check badge**.
- On phones the ring is smaller and habits sit in **three columns**; long names
  wrap to two lines instead of being cut off.
- The date is compact ("Nov 18, 2026") so it fits one line on a 360px phone.
- A failed load shows a message with **Try again**.

|                       | Before                                                                                                            | After                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Desktop (1280), light | <img src="screens/04-tracker/before--desktop-light.png" width="420" alt="Tracker, desktop (1280), light, before"> | <img src="screens/04-tracker/after--desktop-light.png" width="420" alt="Tracker, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/04-tracker/before--desktop-dark.png" width="420" alt="Tracker, desktop (1280), dark, before">   | <img src="screens/04-tracker/after--desktop-dark.png" width="420" alt="Tracker, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/04-tracker/before--mobile-light.png" width="260" alt="Tracker, phone (390), light, before">     | <img src="screens/04-tracker/after--mobile-light.png" width="260" alt="Tracker, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/04-tracker/before--mobile-dark.png" width="260" alt="Tracker, phone (390), dark, before">       | <img src="screens/04-tracker/after--mobile-dark.png" width="260" alt="Tracker, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/04-tracker/before--tablet-light.png" width="320" alt="Tracker, tablet (768), light, before">    | <img src="screens/04-tracker/after--tablet-light.png" width="320" alt="Tracker, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/04-tracker/before--wide-light.png" width="420" alt="Tracker, wide (1920), light, before">       | <img src="screens/04-tracker/after--wide-light.png" width="420" alt="Tracker, wide (1920), light, after">       |

### Tracker, a day with nothing due

`/`, previous day

- **Bug fix:** a day with no habits due said "No habits yet" and offered Add
  habit, even to someone with habits. It now says **Nothing scheduled**. The
  first-habit prompt is kept for people with no habits at all.
- To tell the two apart the Tracker asks for the full habit list, but only on a
  day with nothing due, so a normal day costs no extra request.

|                       | Before                                                                                                                                              | After                                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop (1280), light | <img src="screens/14-tracker-other-day/before--desktop-light.png" width="420" alt="Tracker, a day with nothing due, desktop (1280), light, before"> | <img src="screens/14-tracker-other-day/after--desktop-light.png" width="420" alt="Tracker, a day with nothing due, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/14-tracker-other-day/before--desktop-dark.png" width="420" alt="Tracker, a day with nothing due, desktop (1280), dark, before">   | <img src="screens/14-tracker-other-day/after--desktop-dark.png" width="420" alt="Tracker, a day with nothing due, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/14-tracker-other-day/before--mobile-light.png" width="260" alt="Tracker, a day with nothing due, phone (390), light, before">     | <img src="screens/14-tracker-other-day/after--mobile-light.png" width="260" alt="Tracker, a day with nothing due, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/14-tracker-other-day/before--mobile-dark.png" width="260" alt="Tracker, a day with nothing due, phone (390), dark, before">       | <img src="screens/14-tracker-other-day/after--mobile-dark.png" width="260" alt="Tracker, a day with nothing due, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/14-tracker-other-day/before--tablet-light.png" width="320" alt="Tracker, a day with nothing due, tablet (768), light, before">    | <img src="screens/14-tracker-other-day/after--tablet-light.png" width="320" alt="Tracker, a day with nothing due, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/14-tracker-other-day/before--wide-light.png" width="420" alt="Tracker, a day with nothing due, wide (1920), light, before">       | <img src="screens/14-tracker-other-day/after--wide-light.png" width="420" alt="Tracker, a day with nothing due, wide (1920), light, after">       |

### Habit coach

Chat button (wider screens) or Coach tab (phones)

- The panel was **see-through**: it used colour classes this Tailwind setup
  never defines. It now uses the theme tokens, so it is opaque and on-brand, and
  the chat button has its fill back.
- On phones the coach opens from the tab bar's **Coach** tab; the floating
  button covered content at that width.
- A 44px close button, 16px input text (smaller text makes iOS Safari zoom the
  page), larger suggestion chips, a shorter placeholder and safe-area padding.
- The message box has an accessible name, "Ask the habit coach".

|                       | Before                                                                                                             | After                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Desktop (1280), light | <img src="screens/05-chat/before--desktop-light.png" width="420" alt="Habit coach, desktop (1280), light, before"> | <img src="screens/05-chat/after--desktop-light.png" width="420" alt="Habit coach, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/05-chat/before--desktop-dark.png" width="420" alt="Habit coach, desktop (1280), dark, before">   | <img src="screens/05-chat/after--desktop-dark.png" width="420" alt="Habit coach, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/05-chat/before--mobile-light.png" width="260" alt="Habit coach, phone (390), light, before">     | <img src="screens/05-chat/after--mobile-light.png" width="260" alt="Habit coach, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/05-chat/before--mobile-dark.png" width="260" alt="Habit coach, phone (390), dark, before">       | <img src="screens/05-chat/after--mobile-dark.png" width="260" alt="Habit coach, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/05-chat/before--tablet-light.png" width="320" alt="Habit coach, tablet (768), light, before">    | <img src="screens/05-chat/after--tablet-light.png" width="320" alt="Habit coach, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/05-chat/before--wide-light.png" width="420" alt="Habit coach, wide (1920), light, before">       | <img src="screens/05-chat/after--wide-light.png" width="420" alt="Habit coach, wide (1920), light, after">       |

### Habits overview

`/habits`

- On phones each habit is a **card** with its frequency, status, start date and
  44px Edit and Delete buttons.
- In the table a habit due every day reads **Daily**; long names wrap instead of
  being cut off on tablets, and the start date column appears from 1024px.
- The search field has a label; the unlabelled back arrow is gone.

|                       | Before                                                                                                                   | After                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Desktop (1280), light | <img src="screens/06-habits/before--desktop-light.png" width="420" alt="Habits overview, desktop (1280), light, before"> | <img src="screens/06-habits/after--desktop-light.png" width="420" alt="Habits overview, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/06-habits/before--desktop-dark.png" width="420" alt="Habits overview, desktop (1280), dark, before">   | <img src="screens/06-habits/after--desktop-dark.png" width="420" alt="Habits overview, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/06-habits/before--mobile-light.png" width="260" alt="Habits overview, phone (390), light, before">     | <img src="screens/06-habits/after--mobile-light.png" width="260" alt="Habits overview, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/06-habits/before--mobile-dark.png" width="260" alt="Habits overview, phone (390), dark, before">       | <img src="screens/06-habits/after--mobile-dark.png" width="260" alt="Habits overview, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/06-habits/before--tablet-light.png" width="320" alt="Habits overview, tablet (768), light, before">    | <img src="screens/06-habits/after--tablet-light.png" width="320" alt="Habits overview, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/06-habits/before--wide-light.png" width="420" alt="Habits overview, wide (1920), light, before">       | <img src="screens/06-habits/after--wide-light.png" width="420" alt="Habits overview, wide (1920), light, after">       |

### Edit habit

`/habits`, Edit

- The same bottom sheet as Add on phones, with **Delete, Cancel and Save Changes
  on one pinned row**.
- The Edit and Stats tabs match every other tab set in the app.

|                       | Before                                                                                                                         | After                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Desktop (1280), light | <img src="screens/07-edit-habit-dialog/before--desktop-light.png" width="420" alt="Edit habit, desktop (1280), light, before"> | <img src="screens/07-edit-habit-dialog/after--desktop-light.png" width="420" alt="Edit habit, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/07-edit-habit-dialog/before--desktop-dark.png" width="420" alt="Edit habit, desktop (1280), dark, before">   | <img src="screens/07-edit-habit-dialog/after--desktop-dark.png" width="420" alt="Edit habit, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/07-edit-habit-dialog/before--mobile-light.png" width="260" alt="Edit habit, phone (390), light, before">     | <img src="screens/07-edit-habit-dialog/after--mobile-light.png" width="260" alt="Edit habit, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/07-edit-habit-dialog/before--mobile-dark.png" width="260" alt="Edit habit, phone (390), dark, before">       | <img src="screens/07-edit-habit-dialog/after--mobile-dark.png" width="260" alt="Edit habit, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/07-edit-habit-dialog/before--tablet-light.png" width="320" alt="Edit habit, tablet (768), light, before">    | <img src="screens/07-edit-habit-dialog/after--tablet-light.png" width="320" alt="Edit habit, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/07-edit-habit-dialog/before--wide-light.png" width="420" alt="Edit habit, wide (1920), light, before">       | <img src="screens/07-edit-habit-dialog/after--wide-light.png" width="420" alt="Edit habit, wide (1920), light, after">       |

### Edit habit: stats

`/habits`, Edit, Stats

- Counts read naturally: **"1 day"**, not "1 days", in the streak figures and
  the encouragement line.
- The tabs match the rest of the app.

|                       | Before                                                                                                                               | After                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Desktop (1280), light | <img src="screens/15-edit-habit-stats/before--desktop-light.png" width="420" alt="Edit habit: stats, desktop (1280), light, before"> | <img src="screens/15-edit-habit-stats/after--desktop-light.png" width="420" alt="Edit habit: stats, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/15-edit-habit-stats/before--desktop-dark.png" width="420" alt="Edit habit: stats, desktop (1280), dark, before">   | <img src="screens/15-edit-habit-stats/after--desktop-dark.png" width="420" alt="Edit habit: stats, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/15-edit-habit-stats/before--mobile-light.png" width="260" alt="Edit habit: stats, phone (390), light, before">     | <img src="screens/15-edit-habit-stats/after--mobile-light.png" width="260" alt="Edit habit: stats, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/15-edit-habit-stats/before--mobile-dark.png" width="260" alt="Edit habit: stats, phone (390), dark, before">       | <img src="screens/15-edit-habit-stats/after--mobile-dark.png" width="260" alt="Edit habit: stats, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/15-edit-habit-stats/before--tablet-light.png" width="320" alt="Edit habit: stats, tablet (768), light, before">    | <img src="screens/15-edit-habit-stats/after--tablet-light.png" width="320" alt="Edit habit: stats, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/15-edit-habit-stats/before--wide-light.png" width="420" alt="Edit habit: stats, wide (1920), light, before">       | <img src="screens/15-edit-habit-stats/after--wide-light.png" width="420" alt="Edit habit: stats, wide (1920), light, after">       |

### Delete habit

`/habits`, Delete

- **Delete is red in dark mode**; it was green, the colour of success.

|                       | Before                                                                                                                             | After                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Desktop (1280), light | <img src="screens/08-delete-habit-dialog/before--desktop-light.png" width="420" alt="Delete habit, desktop (1280), light, before"> | <img src="screens/08-delete-habit-dialog/after--desktop-light.png" width="420" alt="Delete habit, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/08-delete-habit-dialog/before--desktop-dark.png" width="420" alt="Delete habit, desktop (1280), dark, before">   | <img src="screens/08-delete-habit-dialog/after--desktop-dark.png" width="420" alt="Delete habit, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/08-delete-habit-dialog/before--mobile-light.png" width="260" alt="Delete habit, phone (390), light, before">     | <img src="screens/08-delete-habit-dialog/after--mobile-light.png" width="260" alt="Delete habit, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/08-delete-habit-dialog/before--mobile-dark.png" width="260" alt="Delete habit, phone (390), dark, before">       | <img src="screens/08-delete-habit-dialog/after--mobile-dark.png" width="260" alt="Delete habit, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/08-delete-habit-dialog/before--tablet-light.png" width="320" alt="Delete habit, tablet (768), light, before">    | <img src="screens/08-delete-habit-dialog/after--tablet-light.png" width="320" alt="Delete habit, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/08-delete-habit-dialog/before--wide-light.png" width="420" alt="Delete habit, wide (1920), light, before">       | <img src="screens/08-delete-habit-dialog/after--wide-light.png" width="420" alt="Delete habit, wide (1920), light, after">       |

### Habits: empty Archived tab

`/habits`, Archived

- Empty lists **explain themselves**: an icon, what the list holds ("Habits you
  give an end date appear here…"), and the next step.
- A search with no results offers **Clear search**; an empty list offers **Add
  habit**.

|                       | Before                                                                                                                                             | After                                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Desktop (1280), light | <img src="screens/16-habits-archived-empty/before--desktop-light.png" width="420" alt="Habits: empty Archived tab, desktop (1280), light, before"> | <img src="screens/16-habits-archived-empty/after--desktop-light.png" width="420" alt="Habits: empty Archived tab, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/16-habits-archived-empty/before--desktop-dark.png" width="420" alt="Habits: empty Archived tab, desktop (1280), dark, before">   | <img src="screens/16-habits-archived-empty/after--desktop-dark.png" width="420" alt="Habits: empty Archived tab, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/16-habits-archived-empty/before--mobile-light.png" width="260" alt="Habits: empty Archived tab, phone (390), light, before">     | <img src="screens/16-habits-archived-empty/after--mobile-light.png" width="260" alt="Habits: empty Archived tab, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/16-habits-archived-empty/before--mobile-dark.png" width="260" alt="Habits: empty Archived tab, phone (390), dark, before">       | <img src="screens/16-habits-archived-empty/after--mobile-dark.png" width="260" alt="Habits: empty Archived tab, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/16-habits-archived-empty/before--tablet-light.png" width="320" alt="Habits: empty Archived tab, tablet (768), light, before">    | <img src="screens/16-habits-archived-empty/after--tablet-light.png" width="320" alt="Habits: empty Archived tab, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/16-habits-archived-empty/before--wide-light.png" width="420" alt="Habits: empty Archived tab, wide (1920), light, before">       | <img src="screens/16-habits-archived-empty/after--wide-light.png" width="420" alt="Habits: empty Archived tab, wide (1920), light, after">       |

### Progress: history

`/progress`

- **Future days** show a faint dot instead of a "0%" ring; **today** is
  highlighted.
- Streaks read "1 day" or "5 days" as appropriate.
- On phones the streak cards sit side by side and the nested cards use less
  padding; the back arrow is gone.

|                       | Before                                                                                                                               | After                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Desktop (1280), light | <img src="screens/09-progress-history/before--desktop-light.png" width="420" alt="Progress: history, desktop (1280), light, before"> | <img src="screens/09-progress-history/after--desktop-light.png" width="420" alt="Progress: history, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/09-progress-history/before--desktop-dark.png" width="420" alt="Progress: history, desktop (1280), dark, before">   | <img src="screens/09-progress-history/after--desktop-dark.png" width="420" alt="Progress: history, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/09-progress-history/before--mobile-light.png" width="260" alt="Progress: history, phone (390), light, before">     | <img src="screens/09-progress-history/after--mobile-light.png" width="260" alt="Progress: history, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/09-progress-history/before--mobile-dark.png" width="260" alt="Progress: history, phone (390), dark, before">       | <img src="screens/09-progress-history/after--mobile-dark.png" width="260" alt="Progress: history, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/09-progress-history/before--tablet-light.png" width="320" alt="Progress: history, tablet (768), light, before">    | <img src="screens/09-progress-history/after--tablet-light.png" width="320" alt="Progress: history, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/09-progress-history/before--wide-light.png" width="420" alt="Progress: history, wide (1920), light, before">       | <img src="screens/09-progress-history/after--wide-light.png" width="420" alt="Progress: history, wide (1920), light, after">       |

### Progress: completion rate

`/progress`, Completion Rate

- The Y axis always runs **0–100%**.
- On phones the tab reads **Rates** so the three tabs fit; its accessible name
  stays "Completion Rate".

|                       | Before                                                                                                                                     | After                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop (1280), light | <img src="screens/10-progress-chart/before--desktop-light.png" width="420" alt="Progress: completion rate, desktop (1280), light, before"> | <img src="screens/10-progress-chart/after--desktop-light.png" width="420" alt="Progress: completion rate, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/10-progress-chart/before--desktop-dark.png" width="420" alt="Progress: completion rate, desktop (1280), dark, before">   | <img src="screens/10-progress-chart/after--desktop-dark.png" width="420" alt="Progress: completion rate, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/10-progress-chart/before--mobile-light.png" width="260" alt="Progress: completion rate, phone (390), light, before">     | <img src="screens/10-progress-chart/after--mobile-light.png" width="260" alt="Progress: completion rate, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/10-progress-chart/before--mobile-dark.png" width="260" alt="Progress: completion rate, phone (390), dark, before">       | <img src="screens/10-progress-chart/after--mobile-dark.png" width="260" alt="Progress: completion rate, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/10-progress-chart/before--tablet-light.png" width="320" alt="Progress: completion rate, tablet (768), light, before">    | <img src="screens/10-progress-chart/after--tablet-light.png" width="320" alt="Progress: completion rate, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/10-progress-chart/before--wide-light.png" width="420" alt="Progress: completion rate, wide (1920), light, before">       | <img src="screens/10-progress-chart/after--wide-light.png" width="420" alt="Progress: completion rate, wide (1920), light, after">       |

### Progress: achievements

`/progress`, Achievements

- Earned cards use the **brand palette** instead of yellow and orange.
- On phones the category stats are a **two-column grid** under a full-width
  total.
- The category filter scrolls sideways on phones, with 44px chips, and reports
  the selected category (`aria-pressed`).

|                       | Before                                                                                                                                         | After                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop (1280), light | <img src="screens/11-progress-achievements/before--desktop-light.png" width="420" alt="Progress: achievements, desktop (1280), light, before"> | <img src="screens/11-progress-achievements/after--desktop-light.png" width="420" alt="Progress: achievements, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/11-progress-achievements/before--desktop-dark.png" width="420" alt="Progress: achievements, desktop (1280), dark, before">   | <img src="screens/11-progress-achievements/after--desktop-dark.png" width="420" alt="Progress: achievements, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/11-progress-achievements/before--mobile-light.png" width="260" alt="Progress: achievements, phone (390), light, before">     | <img src="screens/11-progress-achievements/after--mobile-light.png" width="260" alt="Progress: achievements, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/11-progress-achievements/before--mobile-dark.png" width="260" alt="Progress: achievements, phone (390), dark, before">       | <img src="screens/11-progress-achievements/after--mobile-dark.png" width="260" alt="Progress: achievements, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/11-progress-achievements/before--tablet-light.png" width="320" alt="Progress: achievements, tablet (768), light, before">    | <img src="screens/11-progress-achievements/after--tablet-light.png" width="320" alt="Progress: achievements, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/11-progress-achievements/before--wide-light.png" width="420" alt="Progress: achievements, wide (1920), light, before">       | <img src="screens/11-progress-achievements/after--wide-light.png" width="420" alt="Progress: achievements, wide (1920), light, after">       |

### Page not found

Any unknown path

- Uses the theme's colours instead of purple and slate; full-width 44px buttons
  on phones.

|                       | Before                                                                                                                     | After                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Desktop (1280), light | <img src="screens/12-not-found/before--desktop-light.png" width="420" alt="Page not found, desktop (1280), light, before"> | <img src="screens/12-not-found/after--desktop-light.png" width="420" alt="Page not found, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/12-not-found/before--desktop-dark.png" width="420" alt="Page not found, desktop (1280), dark, before">   | <img src="screens/12-not-found/after--desktop-dark.png" width="420" alt="Page not found, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/12-not-found/before--mobile-light.png" width="260" alt="Page not found, phone (390), light, before">     | <img src="screens/12-not-found/after--mobile-light.png" width="260" alt="Page not found, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/12-not-found/before--mobile-dark.png" width="260" alt="Page not found, phone (390), dark, before">       | <img src="screens/12-not-found/after--mobile-dark.png" width="260" alt="Page not found, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/12-not-found/before--tablet-light.png" width="320" alt="Page not found, tablet (768), light, before">    | <img src="screens/12-not-found/after--tablet-light.png" width="320" alt="Page not found, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/12-not-found/before--wide-light.png" width="420" alt="Page not found, wide (1920), light, before">       | <img src="screens/12-not-found/after--wide-light.png" width="420" alt="Page not found, wide (1920), light, after">       |

### Tracker, all done

`/` with every habit complete

- Every habit shows the completed fill and check badge, the ring shows its check
  mark, and the summary reads "All 6 done · nice work".

|                       | Before                                                                                                                               | After                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Desktop (1280), light | <img src="screens/13-tracker-all-done/before--desktop-light.png" width="420" alt="Tracker, all done, desktop (1280), light, before"> | <img src="screens/13-tracker-all-done/after--desktop-light.png" width="420" alt="Tracker, all done, desktop (1280), light, after"> |
| Desktop (1280), dark  | <img src="screens/13-tracker-all-done/before--desktop-dark.png" width="420" alt="Tracker, all done, desktop (1280), dark, before">   | <img src="screens/13-tracker-all-done/after--desktop-dark.png" width="420" alt="Tracker, all done, desktop (1280), dark, after">   |
| Phone (390), light    | <img src="screens/13-tracker-all-done/before--mobile-light.png" width="260" alt="Tracker, all done, phone (390), light, before">     | <img src="screens/13-tracker-all-done/after--mobile-light.png" width="260" alt="Tracker, all done, phone (390), light, after">     |
| Phone (390), dark     | <img src="screens/13-tracker-all-done/before--mobile-dark.png" width="260" alt="Tracker, all done, phone (390), dark, before">       | <img src="screens/13-tracker-all-done/after--mobile-dark.png" width="260" alt="Tracker, all done, phone (390), dark, after">       |
| Tablet (768), light   | <img src="screens/13-tracker-all-done/before--tablet-light.png" width="320" alt="Tracker, all done, tablet (768), light, before">    | <img src="screens/13-tracker-all-done/after--tablet-light.png" width="320" alt="Tracker, all done, tablet (768), light, after">    |
| Wide (1920), light    | <img src="screens/13-tracker-all-done/before--wide-light.png" width="420" alt="Tracker, all done, wide (1920), light, before">       | <img src="screens/13-tracker-all-done/after--wide-light.png" width="420" alt="Tracker, all done, wide (1920), light, after">       |
