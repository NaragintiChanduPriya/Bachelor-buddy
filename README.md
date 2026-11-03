# BachelorBuddy

An AI-powered app that helps bachelors in Indian cities manage a monthly budget and find the
cheapest good option for food, groceries, housing, clothes and accessories — in one place.

**Core promise:** spend less on everything, without thinking about it.
**Launch city:** Bangalore.

> **Current state:** frontend only. There is no backend yet. Every screen talks to a real HTTP
> API that is intercepted in the browser by [Mock Service Worker](https://mswjs.io), so the app
> behaves exactly as it will against the real FastAPI service. See
> [Switching to the real API](#switching-to-the-real-api).

---

## Quick start

```bash
npm install
cp .env.example .env.development   # already committed, copy only if you changed it
npm run dev
```

The app starts on <http://localhost:5173> with the mock backend running.

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with mocks (when `VITE_API_MOCKING=enabled`) |
| `npm run build` | Typecheck, then production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier over the repo |
| `npm run test` | Vitest unit and component tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run e2e` | Playwright smoke tests |

---

## Environment variables

Copy `.env.example`. Three variables control everything:

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Base URL for every API call |
| `VITE_API_MOCKING` | `enabled` | `enabled` starts MSW before render; `disabled` talks to a real backend |
| `VITE_MOCK_FAILURE_RATE` | `0.03` | Fraction of mock calls that fail, to exercise error states. `0` disables |
| `VITE_QUERY_DEVTOOLS` | `false` | `true` shows the TanStack Query Devtools launcher in development only |

`.env.production` ships with `VITE_MOCK_FAILURE_RATE=0` so a hosted demo never shows a random
failure, while local development keeps the 3% rate honest.

---

## What's in the app

| Route | What it does |
|---|---|
| `/onboarding` | Four steps: welcome, salary and goal, home and office areas, food and cards |
| `/` | Money left this month, the categories closest to their limit, savings, alerts, a cheap lunch nearby |
| `/chat` | Ask Buddy — the agents answer with live budget, food, product, home, offer and grocery data |
| `/food`, `/food/:id` | Cheap meals near home or office; delivery-vs-eating-there fee breakdown |
| `/groceries` | Editable monthly list priced at four store types, with the bulk-order saving |
| `/shop`, `/shop/:id` | Prices across three platforms, 90-day history, buy-now-or-wait verdict, price alerts |
| `/deals` | Card offers, coupons and cashback the user can use, each with the true final price |
| `/homes`, `/homes/:id` | PGs, co-living and shared flats against the area average, with commute times |
| `/savings` | This month against the goal, by category and by recommendation, a six-month trend, PNG export |
| `/expenses`, `/budget` | Paginated expense list with add and delete; category limits |
| `/notifications`, `/settings` | Agent alerts grouped by day; profile, places, food, cards and theme |

Every list is paginated server-side and keeps the previous page on screen while the next loads;
every data view has a skeleton, an empty state and an error state with retry; every route is
lazy-loaded behind its own error boundary.

---

## Tech stack

React 19 · TypeScript 5.9 (strict) · Vite 7 · Tailwind CSS 4 · TanStack Query 5 ·
React Router 7 (data router) · Zustand 5 · Axios · MSW 2 · react-hook-form + zod ·
Recharts · lucide-react · framer-motion · react-helmet-async ·
Vitest + Testing Library · Playwright · ESLint + Prettier.

---

## Folder structure

```
src/
├─ components/        Shared UI. MoneyText, EmptyState, ErrorState, PageHeader…
│  ├─ ui/             shadcn-style primitives (Button, Card, Badge, Skeleton)
│  └─ theme/          Theme provider (light / dark / system)
├─ features/<domain>/ Feature code: components, hooks, utils per domain
├─ hooks/             Cross-cutting hooks
├─ layouts/           AppLayout (sidebar + header + bottom nav), nav definitions
├─ lib/api/
│  ├─ client.ts       Axios instance, interceptors, envelope unwrapping
│  ├─ ApiError.ts     Normalized error type
│  ├─ queryClient.ts  TanStack Query defaults
│  ├─ queryKeys.ts    One key factory per domain
│  └─ services/       One typed service per domain
├─ mocks/             The mock backend (see below)
├─ routes/            Router, route pages, error and 404 elements
├─ store/             Zustand client state
├─ types/             DTOs — the contract, mirrored in API_CONTRACT.md
└─ utils/             Currency, dates (IST), distance, cn
```

---

## Mock backend architecture

`src/mocks/` is a stand-in for the real service. It is deliberately structured so the FastAPI
backend can be written against the same shapes and the same money logic.

| File | Responsibility |
|---|---|
| `clock.ts` | `mockNow()` — the 15th of the current real month, 12:30 PM IST, plus date helpers |
| `random.ts` | Seeded PRNG (mulberry32) so generated data is identical on every reload |
| `db.ts` | In-memory database built from fixtures; optional `sessionStorage` persistence |
| `fixtures/` | Raw seed data |
| `calc/` | **All money math.** Pure, named, unit-tested — the logic the real backend reimplements |
| `queries/` | Database reads shared by the handlers and the chat agents, so both always agree |
| `handlers/` | One MSW handler file per domain |
| `http.ts` | Envelope helpers, latency, random failure, pagination, query-param parsing |
| `browser.ts` | Worker setup |
| `start.ts` | Starts the worker before React renders |

### Design rules this enforces

1. **Components never import fixtures.** Data reaches the UI only through
   `services/* → TanStack Query hooks`. That includes dropdown options like Bangalore areas,
   which come from `GET /meta/areas`.
2. **Money math lives in the mock backend, never in a component.** Budget remaining, percent
   used, delivery-vs-dine-in differences, final price after an offer and "below area average"
   are all computed in `src/mocks/calc/` and returned in the response. The frontend formats
   numbers; it does not derive them. This mirrors the real design, where the AI explains results
   and backend code does the arithmetic.
3. **Money is integer rupees** and is formatted only through `formatINR`.
4. **One clock.** Every fixture date is generated relative to `mockNow()`, so the demo always
   looks current — "about 70% of the food budget used by the 15th" holds in any real month.
5. **Deterministic data.** Seeded randomness keeps charts stable across reloads. Random API
   failures use `Math.random` on purpose, so toggling them never shifts the seeded data.

### Live mutations

Mutations write to the in-memory database, so the session feels real: logging an expense changes
budget remaining, the category bars, the expense list and savings on the next fetch. Grocery
list edits, price alerts and read notifications work the same way. The database persists to
`sessionStorage` for the tab; closing the tab starts fresh.

### Brand names

All delivery apps, quick-commerce services, e-commerce platforms, restaurants and PGs are
invented (FeastDrop, ZipCart, ShopNest, Sri Ganesh Tiffin Room…). Real bank names are used only
for card offers, which is factual. There are no real logos — visuals are icons, initials and
gradient thumbnails.

---

## Switching to the real API

No code changes are needed. Set two environment variables:

```bash
VITE_API_MOCKING=disabled
VITE_API_BASE_URL=https://api.bachelorbuddy.app
```

MSW is then never started, and the same Axios client sends the same requests to the real
service. The backend must implement [`API_CONTRACT.md`](./API_CONTRACT.md) exactly: the same
paths, the same envelope and the same DTOs as `src/types/`.

`public/mockServiceWorker.js` is kept in the repo so a production build can also run with mocks
for demo hosting.

---

## Accessibility

Semantic landmarks, a skip link, full keyboard navigation with visible focus rings, ARIA labels
on icon-only controls, WCAG AA contrast in both themes, and text summaries alongside charts.
Animation is subtle and respects `prefers-reduced-motion`.

---

## Build progress

See the Progress section of [`CLAUDE.md`](./CLAUDE.md).
