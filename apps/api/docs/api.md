# API Reference

Every endpoint the API serves. Request and response shapes are not repeated
here: each is a zod schema in [`packages/contracts`](../../../packages/contracts/src),
named in the tables below. The API validates requests with those schemas, the
web app takes its types from them, and `src/tests/contract.test.ts` checks
every response against them, so they are the definition.

- **Production:** `https://tracknstick-api.hi-00e.workers.dev`
- **Local:** `http://localhost:3000` (`pnpm dev:api`)

## Authentication

Every `/api/v1/*` endpoint needs a Clerk session token:

```
Authorization: Bearer <token>
```

A missing or rejected token is a `401` with code `unauthorized`. Each user only
ever sees and changes their own data. The `/health` endpoints need no token.

## Habits: `/api/v1/habits`

| Method | Path | Request (contracts) | Response (contracts) |
| --- | --- | --- | --- |
| GET | `/` | query `getHabitsByDateSchema` | `habitListResponseSchema` |
| POST | `/` | body `createHabitSchema` | `createHabitResponseSchema` |
| PUT | `/:habitId` | params `habitIdParamSchema`, body `updateHabitSchema` | `updateHabitResponseSchema` |
| DELETE | `/:habitId` | params `habitIdParamSchema` | `deleteHabitResponseSchema` |
| POST | `/:habitId/restore` | params `habitIdParamSchema` | `restoreHabitResponseSchema` |
| GET | `/:habitId/trackers` | params `habitIdParamSchema`, query `getTrackersSchema` | `trackersResponseSchema` |
| POST | `/:habitId/trackers` | params `habitIdParamSchema`, body `manageTrackerSchema` | `toggleTrackerResponseSchema` |
| GET | `/:habitId/stats` | params `habitIdParamSchema`, query `getHabitStatsSchema` | `habitStatsResponseSchema` |

- `GET /` without a `date` lists every habit; with one, only the habits due
  that day, with `completed` for that day in the given `timeZone`.
- `DELETE` is a soft delete; `restore` brings the habit back.
- `POST /:habitId/trackers` toggles: it adds a completion for the day, or
  removes the one already there. With `completed` in the body it sets the day
  to that outcome instead, and changes nothing when the day already has it, so
  sending it again is safe; the web app sends it for changes made offline.

## Progress: `/api/v1/progress`

| Method | Path | Request (contracts) | Response (contracts) |
| --- | --- | --- | --- |
| GET | `/history` | query `progressHistorySchema` | `progressHistoryResponseSchema` |
| GET | `/streaks` | query `progressStreaksSchema` | `progressStreaksResponseSchema` |
| GET | `/overview` | query `progressOverviewSchema` | `progressOverviewResponseSchema` |

History is the completion rate of each day; streaks count days on which every
habit due was completed.

## Achievements: `/api/v1/achievements`

| Method | Path | Request | Response (contracts) |
| --- | --- | --- | --- |
| GET | `/` | query `achievementsQuerySchema` | `achievementListResponseSchema` |
| GET | `/earned` | none | `earnedAchievementsResponseSchema` |
| GET | `/stats` | none | `achievementStatsResponseSchema` |
| POST | `/check` | query `achievementsQuerySchema` | `checkAchievementsResponseSchema` |

`POST /check` awards any achievement the user has newly earned and returns
those. The catalogue comes from migration `0003_seed_achievements.sql`.
Achievements measure the same figures as `/progress/summary`, every day in
the `timeZone` given: the streak (days on which every habit due was
completed), active days, perfect days, the most habits done in one day,
days with a check-in tapped before 8 AM, or at 10 PM or later, on the day it
is for (`tappedAt` on the tracker request, else when the request arrived),
weekend days, returns after a break, and the best completion rate over any
30 days in a row. Habit Legend counts the other achievements earned, so a
check judges it last. Achievements retired by a migration (`is_active = 0`)
are never listed.
`GET /` leaves out any
achievement with no metric in `services/achievementMetrics.ts`, which could
never be earned, unless the user already holds it. An achievement that is
one of a series names its `track` (`TRACKS` in the same file): check-ins,
streak, active days, perfect days or habits, each a ladder of targets on one
count.

## Chat: `/api/v1/chat`

| Method | Path | Request (contracts) | Response |
| --- | --- | --- | --- |
| POST | `/` | body `chatRequestSchema` | streamed plain text |

The reply streams as it is written. A request that fails before the stream
starts is an ordinary JSON error; one that fails mid-stream ends the stream
early.

## Health: `/health`

| Method | Path | Response |
| --- | --- | --- |
| GET | `/` | status, environment and time; never touches the database |
| GET | `/db` | the database check; `500` when it fails |
| GET | `/details` | the database check as a component; `503` when it fails |

## Limits

- Per IP, before authentication: 100 requests a minute to the API as a whole,
  50 to `/api/v1/habits` and 30 to `/api/v1/progress`. `/health` is not
  limited.
- Per user: 10 chat requests a minute.

Over a limit, the API answers `429` with code `too_many_requests` and a
`Retry-After` header.

## Errors

Every error has the body `errorResponseSchema` describes:

```json
{
  "error": {
    "message": "Route not found: GET /api/v1/nothing-here",
    "code": "not_found",
    "requestId": "err_…",
    "timestamp": "2026-11-14T12:00:00.000Z"
  }
}
```

`details` is added for validation failures (`400`, code `validation_error`)
outside production. Production never includes internal details or stack
traces.
