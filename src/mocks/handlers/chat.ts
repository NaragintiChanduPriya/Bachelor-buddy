import { http } from 'msw'
import type { ChatMessageRequest, ChatReply } from '@/types/chat'
import { db, nextId } from '../db'
import { buildBudget } from '../calc/budget'
import { buildMonthlySavings } from '../calc/savings'
import {
  currentMonthSavingsByCategory,
  followedRecommendations,
} from '../fixtures/savings'
import { nowISO } from '../clock'
import { extractAmount, extractArea, matchIntent } from '../chat/intents'
import { formatINR } from '@/utils/currency'
import { ok, validationError, withMockBehaviour } from '../http'
import type { FoodListingSummary } from '@/types/food'

/** Drops the heavy detail fields so chat cards carry only summaries. */
function toSummary(listing: (typeof db.foodListings)[number]): FoodListingSummary {
  const { menu: _menu, description: _d, address: _a, openingTime: _o, closingTime: _c,
    deliveryAvailable: _dl, ...summary } = listing
  return summary
}

function currentBudget() {
  return buildBudget(db.budgetMonth, db.user.preferences.salary, db.budgetLimits, db.expenses)
}

function buildReply(message: string, conversationId: string): ChatReply {
  const intent = matchIntent(message)
  const amount = extractAmount(message)
  const area = extractArea(message, db.areas)
  const prefs = db.user.preferences
  const budget = currentBudget()

  const base = {
    messageId: nextId('msg'),
    conversationId,
    createdAt: nowISO(),
  }

  switch (intent) {
    case 'foodNearby': {
      const nearOffice = /office|work/.test(message.toLowerCase())
      const anchor = nearOffice ? 'office' : 'home'
      const anchorArea = nearOffice ? prefs.officeAreaName : prefs.homeAreaName
      const cap = amount ?? 200

      // "Near my office" has to mean near: a place 8 km away is not an answer to someone who
      // is hungry now, however cheap it is. Walkable first, then widen only if nothing fits.
      const WALKABLE_KM = 2.5
      const distanceOf = (l: (typeof db.foodListings)[number]) =>
        nearOffice ? l.distanceFromOfficeKm : l.distanceFromHomeKm

      const affordable = db.foodListings
        .filter((l) => l.avgMealPrice <= cap)
        .filter((l) => (prefs.foodPreference === 'veg' ? l.veg : true))
        // Somewhere that is shut cannot feed you right now.
        .filter((l) => l.openNow)

      const nearby = affordable.filter((l) => distanceOf(l) <= WALKABLE_KM)
      const pool = nearby.length > 0 ? nearby : affordable
      const widened = nearby.length === 0 && affordable.length > 0

      const matches = pool
        // Cheapest first, then nearest — never by commission.
        .sort((a, b) => a.avgMealPrice - b.avgMealPrice || distanceOf(a) - distanceOf(b))
        .slice(0, 3)

      const food = budget.categories.find((c) => c.id === 'food')!
      const top = matches[0]

      const text = top
        ? `With ${formatINR(cap)} near your ${anchor} in ${anchorArea}, ${top.name} is your best option — a typical meal there is ${formatINR(top.avgMealPrice)}, about ${distanceOf(top)} km away${widened ? `, which is a short ride rather than a walk` : ''}. You have ${formatINR(food.remaining)} left in your food budget this month, so this keeps you comfortably inside it.`
        : `I could not find anything open under ${formatINR(cap)} near your ${anchor} right now. Raising it to about ${formatINR(150)} opens up several messes and darshinis.`

      return {
        ...base,
        text,
        cards: matches.map((listing) => ({ type: 'food' as const, listing: toSummary(listing) })),
        agentsUsed: ['concierge', 'food', 'budget'],
        steps: [
          'Checking your budget…',
          `Finding meals near ${anchorArea}…`,
          'Keeping only places open now and within walking distance…',
          'Ranking by price, then distance…',
        ],
        suggestedFollowUps: [
          'Is delivery cheaper than going there?',
          'How much did I spend on food this month?',
          'Show me monthly tiffin plans',
        ],
      }
    }

    case 'productDeadline': {
      const cap = amount ?? 2000
      const shopping = budget.categories.find((c) => c.id === 'shopping')!
      const affordable = Math.min(cap, shopping.remaining)

      return {
        ...base,
        text: `You have ${formatINR(shopping.remaining)} left in your shopping budget this month, so I searched under ${formatINR(affordable)}. The Shop page has the full comparison across platforms, with the best card offer applied and the delivery date checked against your deadline.`,
        cards: [
          {
            type: 'budgetSummary' as const,
            budget: budget.categories.filter((c) => c.id === 'shopping' || c.id === 'misc'),
          },
        ],
        agentsUsed: ['concierge', 'budget', 'shopping', 'deals'],
        steps: [
          'Checking your shopping budget…',
          'Comparing prices across platforms…',
          'Applying your card offers…',
          'Checking delivery dates…',
        ],
        suggestedFollowUps: [
          'What offers can I use on my cards?',
          'How much have I saved this month?',
        ],
      }
    }

    case 'spendOnFood': {
      const food = budget.categories.find((c) => c.id === 'food')!
      const deliveryCount = db.expenses.filter(
        (e) => e.category === 'food' && e.source === 'delivery',
      )
      const deliveryTotal = deliveryCount.reduce((sum, e) => sum + e.amount, 0)

      return {
        ...base,
        text: `You have spent ${formatINR(food.spent)} on food this month, which is ${food.percentUsed}% of your ${formatINR(food.limit)} budget, leaving ${formatINR(food.remaining)}. ${deliveryCount.length} of those were delivery orders adding up to ${formatINR(deliveryTotal)} — switching a few of those to a mess nearby is the quickest saving available to you.`,
        cards: [
          {
            type: 'budgetSummary' as const,
            budget: budget.categories.filter((c) => c.id === 'food' || c.id === 'groceries'),
          },
        ],
        agentsUsed: ['concierge', 'budget', 'food'],
        steps: ['Adding up this month’s food expenses…', 'Comparing against your budget…'],
        suggestedFollowUps: [
          'Find me a cheap lunch near office',
          'Cheapest way to buy groceries this month',
        ],
      }
    }

    case 'groceryPlan': {
      const groceries = budget.categories.find((c) => c.id === 'groceries')!
      return {
        ...base,
        text: `You have ${formatINR(groceries.remaining)} left in groceries this month. One monthly stock-up from a bulk store beats several small quick-commerce orders, which carry a delivery and handling fee each time. The Groceries page compares your list across all four store types and shows the cheapest for each item.`,
        cards: [],
        agentsUsed: ['concierge', 'grocery', 'budget'],
        steps: [
          'Reading your monthly grocery list…',
          'Comparing store prices…',
          'Checking bulk versus small orders…',
        ],
        suggestedFollowUps: ['How much did I spend on food this month?', 'What am I saving so far?'],
      }
    }

    case 'homeSearch': {
      const cap = amount ?? 12000
      const where = area?.name ?? prefs.homeAreaName
      const rent = budget.categories.find((c) => c.id === 'rent')!

      return {
        ...base,
        text: `You currently budget ${formatINR(rent.limit)} for rent. Looking under ${formatINR(cap)} in ${where} — the Homes page lists bachelor-friendly PGs, co-living spaces and shared flats, each compared against the area average so you can see what is genuinely below market.`,
        cards: [],
        agentsUsed: ['concierge', 'home', 'budget'],
        steps: [
          `Searching ${where} for places under ${formatINR(cap)}…`,
          'Comparing against the area average…',
          'Checking commute to your tech park…',
        ],
        suggestedFollowUps: ['How much am I saving this month?', 'What is left in my budget?'],
      }
    }

    case 'budgetStatus': {
      return {
        ...base,
        text: `You have ${formatINR(budget.totalRemaining)} left for the rest of the month, with ${budget.daysLeftInMonth} days to go. That works out to about ${formatINR(budget.dailySafeSpend)} a day without touching your savings goal.`,
        cards: [
          {
            type: 'budgetSummary' as const,
            budget: budget.categories.filter((c) => c.id !== 'savings').slice(0, 5),
          },
        ],
        agentsUsed: ['concierge', 'budget'],
        steps: ['Reading your budget…', 'Working out a safe daily spend…'],
        suggestedFollowUps: ['How much have I saved this month?', 'Where is my money going?'],
      }
    }

    case 'savingsStatus': {
      const savings = buildMonthlySavings(
        db.budgetMonth,
        prefs.savingsGoal,
        currentMonthSavingsByCategory,
        followedRecommendations,
      )
      const topSource = savings.byCategory[0]

      return {
        ...base,
        text: `${savings.headline} You have kept back ${formatINR(savings.saved)} so far, ${savings.percentOfGoal}% of your ${formatINR(savings.goal)} goal.${topSource ? ` Most of it came from ${topSource.label.toLowerCase()}, at ${formatINR(topSource.saved)}.` : ''}`,
        cards: [],
        agentsUsed: ['concierge', 'savings', 'budget'],
        steps: ['Adding up what you kept back…', 'Comparing against your goal…'],
        suggestedFollowUps: ['What is left in my budget?', 'How much did I spend on food?'],
      }
    }

    case 'deals': {
      const cardNames = prefs.cards.map((c) => c.label).join(', ')
      return {
        ...base,
        text: `You have ${prefs.cards.length} cards saved: ${cardNames}. The Deals page shows every offer you can actually use on them, with the true final price after the discount cap — not the headline percentage.`,
        cards: [],
        agentsUsed: ['concierge', 'deals'],
        steps: ['Checking your saved cards…', 'Finding offers you qualify for…'],
        suggestedFollowUps: ['What is left in my shopping budget?', 'Find me a cheap lunch'],
      }
    }

    default: {
      return {
        ...base,
        text: `I can help with four things: finding cheap good food near you, tracking where your money went, comparing prices before you buy, and finding a cheaper place to live. Try asking me something like one of the suggestions below.`,
        cards: [],
        agentsUsed: ['concierge'],
        steps: ['Working out what you need…'],
        suggestedFollowUps: [
          'I have ₹150 and I am hungry near office',
          'How much did I spend on food this month?',
          'Cheapest way to buy groceries this month',
          'Find a PG under ₹10,000 near Marathahalli',
        ],
      }
    }
  }
}

export const chatHandlers = [
  http.post('*/chat/messages', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const body = (await request.json()) as ChatMessageRequest
    if (!body.message || !body.message.trim()) {
      return validationError('Type a message first.')
    }
    if (body.message.length > 500) {
      return validationError('That message is too long. Keep it under 500 characters.')
    }

    const conversationId = body.conversationId ?? nextId('conv')
    return ok(buildReply(body.message, conversationId))
  }),
]
