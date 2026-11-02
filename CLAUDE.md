# BachelorBuddy: Project Context

This file is the permanent source of truth for this project. Read it at the start of every
session and follow it in every phase. If a request conflicts with this file, ask before acting.

---

## 1. What we are building

**BachelorBuddy** is an AI-powered all-in-one app that helps bachelors living in cities manage
their monthly budget and find the cheapest good options for food, groceries, housing, clothes,
and accessories in one place. A team of AI agents compares prices, suggests nearby affordable
meals and deals, tracks spending, and shows how much the user saves every month.

**Core promise:** "Spend less on everything, without thinking about it."
**Launch city:** Bangalore.

### The problem (user story)
Arjun, 24, is a software engineer in Bangalore earning ₹40,000/month. He lives in a shared flat
in HSR Layout and works on Outer Ring Road (Bellandur). By the 20th of every month his money is
gone and he doesn't know where it went:
- He orders food delivery twice a day; delivery, platform, and packaging fees add up, while a
  darshini or mess near his office serves meals at half the price.
- He buys groceries in small quick-commerce orders instead of one cheaper monthly stock-up.
- He buys clothes at full price, and they go on sale the next week.
- He pays more rent than needed because he chose a place in a hurry.
- He checks five apps for every purchase and still doesn't know if he got the best deal.

### The solution
At signup the user enters salary, home and office areas, food preference, cards, and savings
goal. A team of AI agents then manages spending and recommends the cheapest good option in every
category. In three months Arjun switches lunch to a nearby mess, does one monthly grocery order,
buys clothes during sales, and moves to a cheaper shared flat, saving about ₹8,000/month.

### The agents (powered by the future backend; simulated by mocks for now)
| Agent | Role |
|---|---|
| Concierge (orchestrator) | Understands each message, picks which agents to involve, combines results into one answer |
| Budget | Splits salary into category budgets, tracks spending, warns about overspending |
| Food | Finds cheapest good meals nearby (darshinis, messes, tiffin, restaurants); compares with delivery including all fees |
| Grocery | Builds the monthly list, compares stores, suggests bulk vs small orders |
| Shopping | Compares clothes/accessory prices across platforms; uses price history for "buy now" or "wait" |
| Deals | Finds coupons, bank card offers, cashback; calculates true final price |
| Home | Finds bachelor-friendly PGs, co-living, shared flats; compares rent with area average |
| Savings | Measures money saved; generates the monthly savings report |

Agents use tools (backend functions), have memory (salary, preferences, past choices), and act
proactively (budget on the 1st, lunch suggestion at 12:30 PM, price-drop alerts, grocery reorder
reminders, month-end savings report). In the UI these show up as chat replies with
"agents used" badges, a step-by-step "thinking" state, and agent notifications.

**Example flow:** "Need formal shoes for an interview on Friday, and I'm low on money this month."
→ Concierge detects product need + budget concern + deadline → Budget Agent: ₹1,800 left in
shopping → Shopping Agent: shoes under ₹1,800 deliverable before Friday → Deals Agent: 10% card
offer → Concierge replies with best option, final price, delivery date, remaining budget.

### Trust rule
Always recommend the genuinely cheapest good option, never the one with the highest commission.
Sponsored items must be clearly labelled "Sponsored" and never ranked above cheaper options.

---

## 2. Current scope

**We are building the frontend only.** There is no backend yet. All data comes from real HTTP
calls intercepted by MSW (Mock Service Worker), so the app behaves exactly as it will with the
real backend. The real backend will later be FastAPI + PostgreSQL + Claude API tool-calling
agents, built against `API_CONTRACT.md`. Switching must require only environment variables.

---

## 3. Non-negotiable rules

1. **Components never import mock data.** Only `src/mocks/` may touch fixtures. Everything else
   gets data through `src/lib/api/services/*` → TanStack Query hooks. This includes dropdown
   options like Bangalore areas and tech parks (served by `GET /meta/areas`).
2. **Money math lives in the "backend", never in components.** Budget remaining, percentages
   used, totals, savings, delivery-vs-dine-in differences, final prices after offers, and
   "below area average" values are computed inside MSW handlers (our stand-in backend) and
   returned in responses. The frontend only formats and displays numbers. This mirrors the real
   design, where the AI explains results and backend code does the math.
3. **Money is integer rupees** (`number`, no paise, no floats). Format only with the shared
   `formatINR` utility (`Intl.NumberFormat('en-IN')` → ₹1,23,450).
4. **Deterministic mock clock.** The mock backend uses a single `mockNow()`: the 15th of the
   current real month at 12:30 PM IST. All fixture dates (expenses, offers, price history,
   notifications, savings months) are generated relative to it, so the demo always looks current
   and "about 70% of food budget used by the 15th" is always true.
5. **Deterministic data.** Generated data (price history, etc.) uses a seeded random function so
   charts look the same on every reload. Random API failures use a separate toggle.
6. **Invented brand names only.** No real food delivery, quick-commerce, e-commerce, PG, or
   restaurant brands and no real logos. Near-copies of real brand names are not allowed either.
   Use clearly original names (e.g. delivery apps "FeastDrop", "QuickBite"; quick
   commerce "ZipCart"; e-commerce "ShopNest", "TrendKart", "StyleBay"; restaurants like
   "Sri Ganesh Tiffin Room", "Annapoorna Mess"). Real Indian bank names (HDFC, SBI, ICICI, Axis)
   are fine for card offers. Visuals are icons, initials, and gradient thumbnails.
7. **API shape.** JSON uses camelCase, dates are ISO 8601 strings, IDs are prefixed strings
   (`food_012`, `prod_007`, `home_004`, `exp_031`). Every response uses the envelope:
   ```json
   { "success": true, "data": {}, "meta": { "page": 1, "pageSize": 12, "total": 40 }, "error": null }
   ```
   Errors: `{ "success": false, "data": null, "meta": null, "error": { "code": "NOT_FOUND", "message": "…", "details": null } }`
8. **Types are the contract.** All DTOs live in `src/types/` and must match `API_CONTRACT.md`
   exactly. If one changes, update the other in the same step.
9. **TypeScript strict, no `any`.** `tsc --noEmit` and ESLint must pass with zero errors.

---

## 4. Conventions

- Feature-based code: `src/features/<domain>/{components,hooks,utils}`
- Shared UI in `src/components/`; shadcn/ui primitives in `src/components/ui/`
- One service per domain in `src/lib/api/services/`, each function typed with DTOs
- Query keys via a factory per domain, e.g. `foodKeys.nearby(filters)`, `productKeys.detail(id)`
- Mutations invalidate the related query keys (logging an expense invalidates budget,
  expenses, savings, and dashboard-related keys)
- URL query params are the source of truth for list filters (food, shop, homes, expenses)
- Zustand only for client state: session, onboarding progress, UI preferences, theme
- File names: components `PascalCase.tsx`, hooks `useThing.ts`, utils `camelCase.ts`

## 5. Commands
- `npm run dev`: start with mocks (when `VITE_API_MOCKING=enabled`)
- `npm run build`: production build
- `npm run typecheck`: `tsc --noEmit`
- `npm run lint`: ESLint
- `npm run test`: Vitest
- `npm run e2e`: Playwright

## 6. Working agreement
- Work phase by phase as listed in the build prompt. At the end of every phase run typecheck,
  lint, and tests, fix all issues, then summarize what was built, what was deferred, and what
  is next. Wait for approval before starting the next phase.
- Keep `API_CONTRACT.md` updated as endpoints are implemented.
- Update the "Progress" section below at the end of each phase.

## 7. Progress
- [x] Phase 1: setup, theme, layout, routing, API client, MSW, types, fixtures
      (done: Vite+TS strict, Tailwind v4 theme with light/dark/system, AppLayout with sidebar/
      header/bottom nav, lazy data router with errorElement + 404, axios client with envelope
      unwrapping and typed ApiError, MSW worker, mockNow() clock, seeded random, all DTOs in
      src/types/, areas fixture, in-memory db, GET /meta/areas, 43 unit tests, 5 e2e tests)
- [x] Phase 2: onboarding, dashboard, budget, expenses
      (done: 4-step onboarding with zod validation + route guard + dev demo shortcut, dashboard
      with hero/stats/budget bars/savings/agent alerts, budget page with server-validated limit
      editor, expenses page with URL-synced filters and delete confirmation, add-expense
      dialog/bottom-sheet, 8 endpoints, calc/budget + calc/savings, 85 unit+component tests)
- [x] Phase 3: food pages, Ask Buddy chat
      (done: 35 food listings across 11 areas with menus/distances/timings, /food with tabs +
      URL-synced filters + pagination, /food/:id with full delivery-vs-dine-in fee breakdown,
      calc/delivery with reconciling bills, keyword-intent chat matching all 5 briefed queries,
      rich cards + agents-used badges + animated thinking + follow-up chips, floating Ask Buddy
      side sheet / bottom sheet, 4 endpoints)
- [x] Phase 4: groceries, shop, deals
      (done: 66-item grocery catalog x 4 store types with editable list, store comparison and bulk
      saving; 32 products x 3 platforms with seeded 90-day history, buy/wait verdict, price alerts;
      18 offers with eligibility by saved card and server-computed true final price; 10 endpoints
      incl. GET /groceries/catalog; chat now returns product, offer and grocery-plan cards)
- [x] Phase 5: homes, savings, notifications, settings
      (done: 25 homes with area-average comparison and tech-park commutes, /homes/:id; savings goal
      ring, breakdowns, 6-month chart with table view, canvas PNG export; notifications grouped
      Today/Earlier with mark read/all; settings form for salary, goal, places, food, cards, theme;
      chat home search returns home cards)
- [ ] Phase 6: polish, responsiveness, accessibility, tests, docs
      (done: UI declutter pass — calm PageHeader, one Filters popover per list page with removable
      chips, fewer values per card, mobile nav drawer, top bar realigned with profile in the
      sidebar only, chat only on /chat with plain-text replies, Expenses pagination, Query
      Devtools opt-in via VITE_QUERY_DEVTOOLS, README + API_CONTRACT complete. Per the user, the
      demo shortcut and "Reset demo data" were removed from the UI, and no new tests were written
      or run this phase; e2e specs were updated to onboard through the real form but not run)
