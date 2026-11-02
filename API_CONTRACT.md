# BachelorBuddy API Contract

This document is the specification the FastAPI + PostgreSQL backend will be built from. It is
kept in lockstep with `src/types/` — if one changes, the other changes in the same step.

**Status legend:** ✅ implemented in MSW · ⏳ planned in a later phase.

---

## Conventions

- **Base URL:** `VITE_API_BASE_URL` (default `/api`).
- **Casing:** JSON is `camelCase`.
- **Dates:** ISO 8601 strings in UTC (`2026-10-15T07:00:00.000Z`). The UI renders them in IST.
- **IDs:** prefixed strings — `area_hsr`, `food_012`, `prod_007`, `home_004`, `exp_031`,
  `offer_009`, `notif_003`, `msg_014`.
- **Money:** integer rupees. No paise, no floats. All money math happens server-side; the
  frontend only formats.
- **Auth:** the client sends `Authorization: Bearer <token>` when a token is set. The mock
  backend ignores it; the real backend will require it on everything except `/meta/*`.

### Response envelope

Every successful response:

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "pageSize": 12, "total": 40 },
  "error": null
}
```

`meta` is `null` for non-paginated endpoints.

Every failure:

```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": { "code": "NOT_FOUND", "message": "Food listing was not found.", "details": null }
}
```

### Error codes

| Code | HTTP | Meaning |
|---|---|---|
| `NOT_FOUND` | 404 | The requested resource does not exist |
| `VALIDATION_ERROR` | 422 | Body failed validation; `details` carries field errors |
| `BAD_REQUEST` | 400 | Malformed or contradictory query parameters |
| `CONFLICT` | 409 | The change conflicts with current state (e.g. duplicate alert) |
| `SERVER_ERROR` | 500 | Unexpected server failure |
| `NETWORK_ERROR` | — | Client-side only; the request never reached the server |

### Pagination

List endpoints accept `page` (1-based, default `1`) and `pageSize` (default `12`). The
envelope's `meta` carries `page`, `pageSize` and `total`.

### Mock behaviour

In mock mode every handler adds 300–900 ms of latency and fails randomly at
`VITE_MOCK_FAILURE_RATE` (default `0.03`) with a `SERVER_ERROR`, so the UI's loading and error
states are exercised in normal use. Set it to `0` to disable.

---

## Endpoints

### ✅ GET /meta/areas

Bangalore areas and tech parks. Public, cacheable, changes rarely. This is the only source of
area and tech-park options in the app — components never hard-code them.

**Parameters:** none.

**Response 200**

```json
{
  "success": true,
  "data": {
    "areas": [
      { "id": "area_hsr", "name": "HSR Layout", "lat": 12.9121, "lng": 77.6446, "popular": true },
      { "id": "area_bellandur", "name": "Bellandur", "lat": 12.9304, "lng": 77.6784, "popular": true }
    ],
    "techParks": [
      {
        "id": "park_orbit",
        "name": "Orbit Tech Campus",
        "areaId": "area_bellandur",
        "areaName": "Bellandur",
        "lat": 12.9256,
        "lng": 77.6815
      }
    ]
  },
  "meta": null,
  "error": null
}
```

**Errors:** `SERVER_ERROR`.

---

### ✅ POST /onboarding

Saves the profile and generates the first monthly budget.

**Request**

```json
{
  "salary": 40000,
  "savingsGoal": 8000,
  "homeAreaId": "area_hsr",
  "officeAreaId": "area_bellandur",
  "techParkId": "park_orbit",
  "foodPreference": "veg",
  "cards": [{ "id": "card_hdfc_cc", "bank": "HDFC", "type": "credit", "label": "HDFC Credit Card" }]
}
```

`foodPreference` is one of `veg`, `nonVeg`, `eggetarian`, `vegan`. `techParkId` may be `null`.

**Response 200** — `data` is `{ "user": User, "budget": Budget }`.

The server splits the salary into category limits: the savings goal is honoured first, the rest
is distributed across rent, food, groceries, shopping, travel, bills and misc, and misc absorbs
the rounding remainder so the limits total the salary exactly.

**Errors:** `VALIDATION_ERROR` (salary under ₹5,000, non-integer rupees, savings goal not less
than salary, unknown area or tech park, missing food preference), `SERVER_ERROR`.

---

### ✅ GET /me

Profile, preferences, cards and onboarding status.

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": "user_001",
    "name": "Arjun",
    "email": "arjun@example.com",
    "age": 24,
    "occupation": "Software Engineer",
    "avatarInitials": "A",
    "onboarded": true,
    "joinedAt": "2026-04-18T07:30:00.000Z",
    "preferences": {
      "salary": 40000,
      "savingsGoal": 8000,
      "homeAreaId": "area_hsr",
      "homeAreaName": "HSR Layout",
      "officeAreaId": "area_bellandur",
      "officeAreaName": "Bellandur",
      "techParkId": "park_orbit",
      "techParkName": "Orbit Tech Campus",
      "foodPreference": "veg",
      "cards": [
        { "id": "card_hdfc_cc", "bank": "HDFC", "type": "credit", "label": "HDFC Credit Card" }
      ]
    }
  },
  "meta": null,
  "error": null
}
```

**Errors:** `NOT_FOUND`, `SERVER_ERROR`.

---

### ✅ PUT /me/preferences

Updates any subset of the preferences. Omitted fields keep their current value. Changing the
salary or the savings goal regenerates the category limits.

**Request:** same shape as `POST /onboarding`, every field optional.
**Response 200:** the updated `User`.
**Errors:** `VALIDATION_ERROR`, `SERVER_ERROR`.

---

### ✅ GET /budget/current

The current month's budget. `spent`, `remaining`, `percentUsed` and `status` are derived from
the expense list on every read, so logging an expense changes them immediately.

**Response 200**

```json
{
  "success": true,
  "data": {
    "month": "2026-10",
    "salary": 40000,
    "totalLimit": 40000,
    "totalSpent": 25020,
    "totalRemaining": 14980,
    "percentUsed": 63,
    "daysLeftInMonth": 16,
    "dailySafeSpend": 436,
    "categories": [
      {
        "id": "food",
        "label": "Food",
        "limit": 7500,
        "spent": 5250,
        "remaining": 2250,
        "percentUsed": 70,
        "status": "warning"
      }
    ]
  },
  "meta": null,
  "error": null
}
```

Category ids: `rent`, `food`, `groceries`, `shopping`, `travel`, `bills`, `misc`, `savings`.
`status` is `ok` below 70% used, `warning` from 70%, `danger` from 90%.
`dailySafeSpend` excludes the savings set-aside, so following it never eats into the goal.

**Errors:** `SERVER_ERROR`.

---

### ✅ PUT /budget/current

Updates category limits. The server validates the whole set, not only the changed rows.

**Request**

```json
{ "categories": [{ "id": "food", "limit": 8000 }, { "id": "misc", "limit": 1500 }] }
```

**Response 200:** the recalculated `Budget`.

**Errors:** `VALIDATION_ERROR` — the limits total more than the salary (`details` carries
`{ total, salary }`), a negative limit, a fractional rupee amount, or an unknown category id.

---

### ✅ GET /expenses

Paginated, newest first.

**Query parameters**

| Name | Type | Default | Notes |
|---|---|---|---|
| `month` | `YYYY-MM` | current month | Must match the pattern |
| `category` | category id | all | One of the eight ids, or omitted |
| `page` | integer | 1 | 1-based |
| `pageSize` | integer | 20 | |

**Response 200** — `data` is `{ "expenses": Expense[], "filteredTotal": number }`.
`filteredTotal` sums every expense matching the filter, not just the returned page, so the UI
never adds money up client-side. `meta` carries the pagination.

```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "exp_031",
        "category": "food",
        "categoryLabel": "Food",
        "title": "Lunch — full meals",
        "note": null,
        "amount": 120,
        "merchant": "Annapoorna Mess",
        "source": "manual",
        "spentAt": "2026-10-15T09:14:00.000Z",
        "createdAt": "2026-10-15T09:14:00.000Z"
      }
    ],
    "filteredTotal": 25020
  },
  "meta": { "page": 1, "pageSize": 20, "total": 63 },
  "error": null
}
```

`source` is one of `manual`, `delivery`, `subscription`, `recurring`.

**Errors:** `BAD_REQUEST` (malformed month, unknown category), `SERVER_ERROR`.

---

### ✅ POST /expenses

**Request**

```json
{
  "category": "food",
  "title": "Lunch at the mess",
  "amount": 120,
  "merchant": "Annapoorna Mess",
  "note": null,
  "spentAt": "2026-10-15T09:14:00.000Z"
}
```

`spentAt` is optional and defaults to the server's now. `amount` is integer rupees.

**Response 200** — `data` is `{ "expense": Expense, "category": BudgetCategory }`. The updated
category lets the client reconcile the budget without a second request.

**Errors:** `VALIDATION_ERROR` (unknown or missing category, blank title, non-integer or
non-positive amount, amount above ₹10,00,000, invalid date, a date in the future), `SERVER_ERROR`.

---

### ✅ DELETE /expenses/:id

**Response 200** — `data` is `{ "id": string, "category": BudgetCategory }`.

**Errors:** `NOT_FOUND`, `SERVER_ERROR`.

---

### ✅ GET /savings/monthly

**Query:** `month` (`YYYY-MM`, defaults to the current month).

**Response 200**

```json
{
  "success": true,
  "data": {
    "month": "2026-10",
    "monthLabel": "October 2026",
    "saved": 6980,
    "goal": 8000,
    "percentOfGoal": 87,
    "onTrack": true,
    "projectedByMonthEnd": 11447,
    "byCategory": [{ "category": "food", "label": "Food", "saved": 2250, "percentOfTotal": 32 }],
    "byRecommendation": [
      {
        "id": "rec_001",
        "title": "Switched weekday lunch from delivery to Annapoorna Mess",
        "agent": "food",
        "saved": 1680,
        "followedAt": "2026-10-03T07:00:00.000Z"
      }
    ],
    "headline": "On track to save ₹11,447 this month, past your ₹8,000 goal."
  },
  "meta": null,
  "error": null
}
```

`saved` is money already kept back by underspending, so it is banked rather than a rate.
`projectedByMonthEnd` adds only what the remaining days are expected to contribute, discounted
because fixed costs such as rent land early and the first half of a month always underspends
more than the second.

**Errors:** `BAD_REQUEST` (malformed month), `SERVER_ERROR`.

---

### ✅ GET /savings/history

**Query:** `months` (integer 1–24, default 6).

**Response 200** — `data` is
`{ months: SavingsHistoryPoint[], averageSaved, bestMonth, totalSaved, trendPercent, summary }`.
`summary` is a sentence describing the trend, used as the chart's text alternative.

**Errors:** `BAD_REQUEST` (months outside 1–24 or not an integer), `SERVER_ERROR`.

---

### ✅ GET /notifications

**Response 200** — `data` is
`{ items: AgentNotification[], unreadCount: number, serverNow: string }`.
`serverNow` lets the UI render relative times ("3h ago") against the server's clock rather than
the browser's.

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "notif_001",
        "kind": "mealSuggestion",
        "agent": "food",
        "title": "Lunch near your office for ₹120",
        "body": "Annapoorna Mess in Bellandur is serving full meals at ₹120…",
        "link": "/food?near=office&maxPrice=150",
        "read": false,
        "createdAt": "2026-10-15T07:05:00.000Z"
      }
    ],
    "unreadCount": 4,
    "serverNow": "2026-10-15T07:00:00.000Z"
  },
  "meta": null,
  "error": null
}
```

`kind` is one of `budgetWarning`, `mealSuggestion`, `priceDrop`, `groceryReminder`,
`offerExpiring`, `savingsReport`, `tip`. `agent` is one of the eight agent names.

**Errors:** `SERVER_ERROR`.

---

### ✅ PATCH /notifications/:id/read

Marks one notification read. **Response 200:** the full notifications payload.

**Errors:** `NOT_FOUND`, `SERVER_ERROR`.

---

### ✅ PATCH /notifications/read-all

Marks every notification read. **Response 200:** the full notifications payload.

**Errors:** `SERVER_ERROR`.

---
---

### ✅ GET /food/nearby

Paginated list of eateries, filtered and sorted. Returns summaries; the full menu comes from
`GET /food/:id`.

**Query parameters**

| Name | Type | Default | Notes |
|---|---|---|---|
| `area` | area id | all areas | Must be a known area id |
| `near` | `home` \| `office` | `home` | Which anchor distances and sorting use |
| `maxPrice` | integer | none | Filters on `avgMealPrice`, must be above zero |
| `type` | `darshini` \| `mess` \| `tiffin` \| `restaurant` | all | |
| `veg` | boolean | all | `true` keeps only pure-veg places |
| `sort` | `price` \| `distance` \| `rating` | `price` | |
| `page` | integer | 1 | |
| `pageSize` | integer | 12 | |

**Response 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "food_003",
      "name": "Annapoorna Mess",
      "type": "mess",
      "areaId": "area_hsr",
      "areaName": "HSR Layout",
      "veg": true,
      "rating": 4.6,
      "reviewCount": 599,
      "priceMin": 30,
      "priceMax": 120,
      "avgMealPrice": 102,
      "distanceFromHomeKm": 0.3,
      "distanceFromOfficeKm": 4.7,
      "tags": ["Unlimited rice", "Home style", "Lunch"],
      "openNow": true,
      "timings": "11:30 – 22:00",
      "thumbnailSeed": 4812,
      "sponsored": false,
      "monthlyPlanPrice": null
    }
  ],
  "meta": { "page": 1, "pageSize": 12, "total": 35 },
  "error": null
}
```

`avgMealPrice` is the headline number used for sorting and the `maxPrice` filter. For a tiffin
service it is the monthly plan divided by the meals it covers, so plans and per-dish places can
be compared on the same scale; `monthlyPlanPrice` carries the plan price itself.

**Trust rule:** `sponsored` listings are labelled in the UI and are never re-ranked above a
cheaper option — the server applies the honest sort and leaves them wherever it puts them.

**Errors:** `BAD_REQUEST` (unknown area, type or sort, `near` other than home/office,
`maxPrice` of zero or less), `SERVER_ERROR`.

---

### ✅ GET /food/:id

One listing with its full menu, timings and distances.

**Response 200** — the summary fields above plus:

```json
{
  "description": "Unlimited rice, sambar, rasam and two palyas on a banana leaf.",
  "address": "19th Main, Sector 3, HSR Layout",
  "openingTime": "11:30",
  "closingTime": "22:00",
  "deliveryAvailable": true,
  "menu": [
    { "id": "food_003_item_01", "name": "Full Meals (unlimited rice)", "price": 120, "veg": true, "popular": true }
  ]
}
```

**Errors:** `NOT_FOUND`, `SERVER_ERROR`.

---

### ✅ GET /food/:id/compare-delivery

The same dish eaten in person versus delivered, with every fee itemised. This is the
calculation behind the product's core claim, so all of it happens server-side.

**Query:** `dish` (optional menu item name, case-insensitive). Defaults to a popular main, never
a monthly plan.

**Response 200**

```json
{
  "success": true,
  "data": {
    "listingId": "food_003",
    "listingName": "Annapoorna Mess",
    "dish": "Full Meals (unlimited rice)",
    "dineInPrice": 120,
    "cheapestDelivery": {
      "platform": "DabbaRun",
      "itemPrice": 134,
      "deliveryFee": 61,
      "platformFee": 8,
      "packagingFee": 15,
      "taxes": 7,
      "total": 225
    },
    "deliveryOptions": [],
    "amountSaved": 105,
    "percentSaved": 47,
    "monthlySavingIfSwitched": 2310
  },
  "meta": null,
  "error": null
}
```

`deliveryOptions` holds every platform, cheapest first; `cheapestDelivery` is the first of them.
Within each breakdown `itemPrice + deliveryFee + platformFee + packagingFee + taxes` equals
`total` exactly — each part is rounded to whole rupees so the bill always reconciles. Delivery
platforms list a marked-up item price, which is why `itemPrice` exceeds `dineInPrice`. Delivery
fees add a per-km charge beyond the first two kilometres. `monthlySavingIfSwitched` projects
the per-meal saving over 22 weekday meals.

**Errors:** `NOT_FOUND`, `BAD_REQUEST` (the place does not deliver), `SERVER_ERROR`.

---

### ✅ POST /chat/messages

The Concierge agent. The handler matches the message against keyword intents and then calls the
same calculation modules and database queries the other endpoints use, so a number quoted in
chat always matches the number on the corresponding page.

**Request**

```json
{ "message": "I have ₹150 and I am hungry near office", "conversationId": null }
```

`conversationId` is `null` on the first message; the reply carries the id to send next time.

**Response 200**

```json
{
  "success": true,
  "data": {
    "messageId": "msg_1042",
    "conversationId": "conv_1041",
    "text": "With ₹150 near your office in Bellandur, Tea Tapri is your best option…",
    "cards": [{ "type": "food", "listing": {} }],
    "agentsUsed": ["concierge", "food", "budget"],
    "steps": ["Checking your budget…", "Finding meals near Bellandur…"],
    "suggestedFollowUps": ["Is delivery cheaper than going there?"],
    "createdAt": "2026-10-15T07:00:00.000Z"
  },
  "meta": null,
  "error": null
}
```

`agentsUsed` is drawn from `concierge`, `budget`, `food`, `grocery`, `shopping`, `deals`,
`home`, `savings`. A `ChatCard` is one of `food`, `product`, `home`, `budgetSummary`, `offer`
or `groceryPlan`.

**Recognised intents:** cheap food nearby, a product with a deadline and a budget, food spend
this month, the monthly grocery plan, a place to live, budget status, savings status, and card
offers. Anything else returns a friendly fallback listing what Buddy can help with.

The food intent keeps only places that are open now and within walking distance of the chosen
anchor, widening the radius only when nothing nearby fits — a cheaper place eight kilometres
away is not an answer to someone who is hungry now.

**Errors:** `VALIDATION_ERROR` (empty message, or longer than 500 characters), `SERVER_ERROR`.

---

### ⏳ Planned endpoints

The following are specified in the build prompt and will be documented in full — with
parameters, request bodies, response examples and error codes — as each phase implements them.

| Method | Path | Phase |
|---|---|---|
| GET | `/groceries/list` | 4 |
| PUT | `/groceries/list` | 4 |
| GET | `/groceries/compare` | 4 |
| GET | `/products/search` | 4 |
| GET | `/products/:id` | 4 |
| GET | `/products/:id/price-history` | 4 |
| GET | `/products/alerts` | 4 |
| POST | `/products/:id/price-alert` | 4 |
| DELETE | `/products/:id/price-alert` | 4 |
| GET | `/offers` | 4 |
| GET | `/homes/search` | 5 |
| GET | `/homes/:id` | 5 |
