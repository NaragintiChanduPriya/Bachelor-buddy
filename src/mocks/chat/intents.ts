import type { AgentName, ChatCard } from '@/types/chat'
import type { ProductCategory } from '@/types/product'

export interface IntentMatch {
  id: string
  /** Every keyword group must have at least one hit for the intent to match. */
  allOf: string[][]
  /** Extra weight when these appear, used to break ties between intents. */
  boost?: string[]
}

export interface IntentResult {
  text: string
  cards: ChatCard[]
  agentsUsed: AgentName[]
  steps: string[]
  suggestedFollowUps: string[]
}

/**
 * Keyword intents, ordered by specificity. The first match with the highest score wins, so
 * narrow intents ("formal shoes under X") are listed before broad ones ("I'm hungry").
 */
export const intents: IntentMatch[] = [
  {
    id: 'productDeadline',
    allOf: [
      ['shoes', 'shirt', 'jeans', 'backpack', 'earphones', 'watch', 'raincoat', 'helmet', 'buy'],
      ['under', 'below', 'budget', 'cheap', '₹', 'rs', 'interview', 'friday', 'need'],
    ],
    boost: ['interview', 'friday', 'formal'],
  },
  {
    id: 'foodNearby',
    allOf: [
      ['hungry', 'eat', 'food', 'lunch', 'dinner', 'breakfast', 'meal', 'meals'],
      ['near', 'office', 'home', 'nearby', 'around', '₹', 'rs', 'cheap', 'have'],
    ],
    boost: ['hungry', 'office', 'lunch'],
  },
  {
    id: 'spendOnFood',
    allOf: [
      ['spend', 'spent', 'spending'],
      ['food', 'eating', 'meals', 'month'],
    ],
    boost: ['how much'],
  },
  {
    id: 'groceryPlan',
    allOf: [
      ['grocery', 'groceries', 'ration', 'rice', 'dal', 'stock'],
      ['cheap', 'cheapest', 'buy', 'month', 'monthly', 'where', 'order', 'way'],
    ],
  },
  {
    id: 'homeSearch',
    allOf: [
      ['pg', 'flat', 'room', 'house', 'home', 'rent', 'coliving', 'co-living'],
      ['under', 'near', 'below', 'find', 'cheap', '₹', 'rs', 'looking'],
    ],
    boost: ['pg', 'rent'],
  },
  {
    id: 'budgetStatus',
    allOf: [
      ['budget', 'left', 'remaining', 'afford', 'money'],
      ['how', 'much', 'what', 'this', 'month', 'i'],
    ],
  },
  {
    id: 'savingsStatus',
    allOf: [
      ['save', 'saved', 'saving', 'savings'],
      ['how', 'much', 'month', 'goal', 'this', 'am'],
    ],
  },
  {
    id: 'deals',
    allOf: [
      ['offer', 'offers', 'deal', 'deals', 'coupon', 'cashback', 'discount'],
      ['any', 'card', 'have', 'show', 'what', 'available', 'my'],
    ],
  },
]

/** Scores a message against the intents and returns the best id, or null for the fallback. */
export function matchIntent(message: string): string | null {
  const text = message.toLowerCase()
  let best: { id: string; score: number } | null = null

  for (const intent of intents) {
    const groupHits = intent.allOf.map(
      (group) => group.filter((keyword) => text.includes(keyword)).length,
    )
    // Every group needs a hit, so a message about food does not match the product intent.
    if (groupHits.some((hits) => hits === 0)) continue

    const base = groupHits.reduce((sum, hits) => sum + hits, 0)
    const boost = (intent.boost ?? []).filter((keyword) => text.includes(keyword)).length * 2
    const score = base + boost

    if (!best || score > best.score) best = { id: intent.id, score }
  }

  return best?.id ?? null
}

/** Pulls the first rupee amount out of a message, e.g. "under ₹1,500" or "I have 150". */
export function extractAmount(message: string): number | null {
  const match = message.replace(/,/g, '').match(/(?:₹|rs\.?\s*)?(\d{2,6})/i)
  if (!match?.[1]) return null
  const value = Number.parseInt(match[1], 10)
  return Number.isFinite(value) ? value : null
}

const categoryKeywords: Array<[ProductCategory, RegExp]> = [
  ['formalShoes', /\b(formal )?shoes?\b|\boxfords?\b|\bderby\b/],
  ['shirts', /\bshirts?\b/],
  ['jeans', /\bjeans\b|\bdenims?\b/],
  ['backpacks', /\bbackpacks?\b|\blaptop bag\b|\bbags?\b/],
  ['earphones', /\bearphones?\b|\bearbuds?\b|\bheadphones?\b/],
  ['watches', /\bwatch(es)?\b/],
  ['raincoats', /\braincoats?\b|\brain jacket\b/],
  ['helmets', /\bhelmets?\b/],
]

/** Maps "formal shoes" or "earbuds" to the product category the Shopping agent searches. */
export function extractProductCategory(message: string): ProductCategory | null {
  const text = message.toLowerCase()
  return categoryKeywords.find(([, pattern]) => pattern.test(text))?.[0] ?? null
}

/** Finds an area name mentioned in the message, so "near Marathahalli" filters correctly. */
export function extractArea(
  message: string,
  areas: Array<{ id: string; name: string }>,
): { id: string; name: string } | null {
  const text = message.toLowerCase()
  return areas.find((area) => text.includes(area.name.toLowerCase())) ?? null
}
