import { http } from 'msw'
import type { ChatMessageRequest, ChatReply } from '@/types/chat'
import { db, nextId } from '../db'
import { buildBudget } from '../calc/budget'
import { buildMonthlySavings } from '../calc/savings'
import {
  currentMonthSavingsByCategory,
  followedRecommendations,
} from '../fixtures/savings'
import { daysUntilNextFriday, nowISO } from '../clock'
import { extractAmount, extractArea, extractProductCategory, matchIntent } from '../chat/intents'
import { formatINR } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { productCategoryLabels } from '@/features/shop/utils/productCategories'
import { ok, validationError, withMockBehaviour } from '../http'
import { currentGroceryComparison, currentGroceryPlanSummary } from '../queries/groceries'
import { searchHomes } from '../queries/homes'
import { getProductDetail, searchProducts } from '../queries/products'
import { listOffers } from '../queries/offers'
import type { FoodListingSummary } from '@/types/food'
import type { HomeType } from '@/types/home'

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
      const lower = message.toLowerCase()
      const shopping = budget.categories.find((c) => c.id === 'shopping')!
      const category = extractProductCategory(message) ?? undefined
      const label = category ? productCategoryLabels[category].toLowerCase() : 'options'
      const cap = amount ?? Math.max(shopping.remaining, 0)
      // Never search above what is left to spend, unless nothing is left at all.
      const limit = shopping.remaining > 0 ? Math.min(cap, shopping.remaining) : cap
      const hasDeadline = /friday|interview|urgent|tomorrow|this week|before/.test(lower)
      const fridayInDays = daysUntilNextFriday()

      const search = (maxPrice: number) =>
        searchProducts({ category, maxPrice, sort: 'price' }).filter(
          (p) => !hasDeadline || p.fastestDeliveryDays <= fridayInDays,
        )

      // Cheapest first, the same ranking the Shop page uses — never by commission.
      let matches = search(limit)
      const widened = matches.length === 0 && shopping.remaining > limit
      if (widened) matches = search(shopping.remaining)

      const top = matches.slice(0, 3)
      const best = top[0] ? getProductDetail(top[0].id) : null
      const bestRow = best?.platforms.find((p) => p.platform === best.bestDealPlatform)
      const leftAfter = best ? shopping.remaining - best.finalPrice : shopping.remaining

      let text: string
      if (!best) {
        text = `I could not find ${label} under ${formatINR(limit)}${hasDeadline ? ' that arrive before Friday' : ''}. You have ${formatINR(shopping.remaining)} left in shopping this month — raising the limit a little, or dropping the delivery deadline, opens up more options.`
      } else {
        const offerPart = best.bestOffer
          ? ` after the ${best.bestOffer.title.replace(/\.$/, '')} offer, down from ${formatINR(best.bestDealBasePrice)}`
          : ''
        const deliveryPart = bestRow
          ? ` It arrives by ${formatDate(bestRow.deliveryBy)}${hasDeadline && bestRow.deliveryDays <= fridayInDays ? ', in time for Friday' : ''}.`
          : ''
        text = `${widened ? `Nothing fits under ${formatINR(limit)}, so I looked up to your remaining ${formatINR(shopping.remaining)}. ` : ''}Your best option is the ${best.name} from ${best.brand}: ${formatINR(best.finalPrice)} on ${best.bestDealPlatform}${offerPart}.${deliveryPart} ${best.verdict === 'buyNow' ? 'The price is good right now.' : 'The price usually dips in sales, but with your deadline it is worth buying now.'} That leaves ${formatINR(Math.max(leftAfter, 0))} in your shopping budget this month.`
      }

      const cards: ChatReply['cards'] = top.map((product) => ({ type: 'product' as const, product }))
      if (best?.bestOffer) cards.push({ type: 'offer' as const, offer: best.bestOffer })

      return {
        ...base,
        text,
        cards,
        agentsUsed: ['concierge', 'budget', 'shopping', 'deals'],
        steps: [
          'Checking your shopping budget…',
          `Comparing ${label} under ${formatINR(limit)} across platforms…`,
          hasDeadline ? 'Keeping only what arrives before Friday…' : 'Checking delivery dates…',
          'Applying the best offer on your cards…',
        ],
        suggestedFollowUps: [
          'What offers can I use on my cards?',
          'What is left in my budget?',
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
      // The same comparison the Groceries page shows, so the numbers always agree.
      const comparison = currentGroceryComparison()
      const plan = currentGroceryPlanSummary()
      const fitsBudget = plan.estimatedTotal <= groceries.remaining

      return {
        ...base,
        text:
          plan.itemCount === 0
            ? `Your monthly grocery list is empty. Add your staples on the Groceries page and I will find the cheapest store for each one.`
            : `Your ${plan.itemCount}-item list costs ${formatINR(plan.estimatedTotal)} if you buy each item where it is cheapest — ${plan.cheapestStoreLabel} is the best single store. Doing it as one monthly bulk order saves ${formatINR(plan.bulkSaving)}, and the same list on quick commerce would cost ${formatINR(comparison.quickCommerceExtra)} more. You have ${formatINR(groceries.remaining)} left in groceries, so this ${fitsBudget ? 'fits comfortably' : 'needs a little trimming'}.`,
        cards: plan.itemCount === 0 ? [] : [{ type: 'groceryPlan' as const, plan }],
        agentsUsed: ['concierge', 'grocery', 'budget'],
        steps: [
          'Reading your monthly grocery list…',
          'Comparing prices across four store types…',
          'Checking bulk packs against small orders…',
          'Checking your groceries budget…',
        ],
        suggestedFollowUps: [
          'How much did I spend on food this month?',
          'What offers can I use on my cards?',
          'How much have I saved this month?',
        ],
      }
    }

    case 'homeSearch': {
      const cap = amount ?? 12000
      const lower = message.toLowerCase()
      const type: HomeType | undefined = /\bpgs?\b/.test(lower)
        ? 'pg'
        : /co-?living/.test(lower)
          ? 'coliving'
          : /\bflat\b/.test(lower)
            ? 'sharedFlat'
            : undefined
      const typeLabel =
        type === 'pg' ? 'PGs' : type === 'coliving' ? 'co-living spaces' : type === 'sharedFlat' ? 'shared flats' : 'places'
      const where = area?.name ?? 'Bangalore'
      const rent = budget.categories.find((c) => c.id === 'rent')!

      // Same query the Homes page runs: cheapest first, sponsored never ranked above cheaper.
      const matches = searchHomes({ area: area?.id, maxRent: cap, type })
      const top = matches[0]
      const freedUp = top ? rent.limit - top.rent : 0

      const text = top
        ? `I found ${matches.length} ${typeLabel} under ${formatINR(cap)} in ${where}. The cheapest is ${top.name} at ${formatINR(top.rent)} a month${top.foodIncluded ? ' with food included' : ''}, ${top.belowAverage ? `${formatINR(Math.abs(top.differenceFromAverage))} below` : top.differenceFromAverage === 0 ? 'right at' : `${formatINR(top.differenceFromAverage)} above`} the area average.${freedUp > 0 ? ` Against the ${formatINR(rent.limit)} you budget for rent now, that frees up ${formatINR(freedUp)} a month.` : ''}`
        : `Nothing in ${where} comes in under ${formatINR(cap)} right now. Raising the limit a little, or looking one area over, usually opens up a few options.`

      return {
        ...base,
        text,
        cards: matches.slice(0, 3).map((home) => ({ type: 'home' as const, home })),
        agentsUsed: ['concierge', 'home', 'budget'],
        steps: [
          `Searching ${where} for ${typeLabel} under ${formatINR(cap)}…`,
          'Comparing each rent against the area average…',
          'Checking the commute to your tech park…',
        ],
        suggestedFollowUps: [
          'Show me co-living under ₹15,000 near Bellandur',
          'What is left in my budget?',
          'How much have I saved this month?',
        ],
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
      // Same list the Deals page shows: usable offers only, soonest-ending first.
      const usable = listOffers({ eligibleOnly: true })
      const expiring = usable.filter((offer) => offer.expiringSoon)
      const first = usable[0]

      const text = first
        ? `You can use ${usable.length} offers on your ${prefs.cards.length} saved cards right now${expiring.length > 0 ? `, and ${expiring.length} end within three days` : ''}. ${first.title} on ${first.platform} ${first.daysLeft <= 0 ? 'ends today' : `has ${first.daysLeft} ${first.daysLeft === 1 ? 'day' : 'days'} left`} — on a ${formatINR(first.example.orderValue)} order you would pay ${formatINR(first.example.finalPrice)}, a real ${first.example.effectivePercent}% off after the cap.`
        : `None of the live offers work with your saved cards at the moment. Adding a card in Settings, or checking back in a few days, usually turns up something.`

      return {
        ...base,
        text,
        cards: usable.slice(0, 3).map((offer) => ({ type: 'offer' as const, offer })),
        agentsUsed: ['concierge', 'deals'],
        steps: [
          'Checking your saved cards…',
          'Finding offers you qualify for…',
          'Working out the true price after each cap…',
        ],
        suggestedFollowUps: [
          'Formal shoes under ₹1,500 for an interview on Friday',
          'What is left in my budget?',
          'Cheapest way to buy groceries this month',
        ],
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
