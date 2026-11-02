import type { Offer, OfferApplication, OfferExample } from '@/types/offer'
import type { SavedCard } from '@/types/user'
import { toISTDateKey } from '@/utils/date'

/**
 * The discount an offer gives on an order, in whole rupees. Percent offers are capped by
 * `maxDiscount`; flat offers never exceed the order itself; below the minimum order it is 0.
 */
export function offerDiscount(
  orderValue: number,
  offer: Pick<Offer, 'discountPercent' | 'flatDiscount' | 'maxDiscount' | 'minOrderValue'>,
): number {
  if (orderValue <= 0 || orderValue < offer.minOrderValue) return 0

  let discount = 0
  if (offer.discountPercent !== null) {
    discount = Math.floor((orderValue * offer.discountPercent) / 100)
    if (offer.maxDiscount !== null) discount = Math.min(discount, offer.maxDiscount)
  } else if (offer.flatDiscount !== null) {
    discount = offer.flatDiscount
  }
  return Math.max(0, Math.min(discount, orderValue))
}

/** The true final price after an offer — the number the Deals agent always leads with. */
export function applyOffer(price: number, offer: Offer): OfferApplication {
  const discount = offerDiscount(price, offer)
  return { offer, originalPrice: price, discount, finalPrice: price - discount }
}

/** Worked example for the Deals page: what the offer is really worth on this order. */
export function buildOfferExample(
  orderValue: number,
  offer: Pick<Offer, 'discountPercent' | 'flatDiscount' | 'maxDiscount' | 'minOrderValue'>,
): OfferExample {
  const discount = offerDiscount(orderValue, offer)
  return {
    orderValue,
    discount,
    finalPrice: orderValue - discount,
    effectivePercent: orderValue > 0 ? Math.round((discount / orderValue) * 100) : 0,
  }
}

/**
 * The offer that gives the lowest final price on this platform. Only offers the user can
 * actually use count — a headline discount on a card they do not hold is worth nothing.
 */
export function bestOfferFor(
  price: number,
  platform: string,
  offers: Offer[],
): OfferApplication | null {
  let best: OfferApplication | null = null
  for (const offer of offers) {
    if (!offer.eligible || offer.platform !== platform) continue
    const application = applyOffer(price, offer)
    if (application.discount <= 0) continue
    if (!best || application.discount > best.discount) best = application
  }
  return best
}

/** Whether a card-bound offer matches one of the user's saved cards (bank and card type). */
export function cardMatches(
  offer: Pick<Offer, 'bank' | 'cardType'>,
  cards: Array<Pick<SavedCard, 'bank' | 'type'>>,
): boolean {
  if (!offer.bank) return true
  return cards.some(
    (card) =>
      card.bank.toLowerCase() === offer.bank!.toLowerCase() &&
      (offer.cardType === null || card.type === offer.cardType),
  )
}

/** Explains why a card offer is out of reach, naming the card the user would need. */
export function ineligibleReason(
  offer: Pick<Offer, 'bank' | 'cardType'>,
  cards: Array<Pick<SavedCard, 'bank' | 'type'>>,
): string | null {
  if (cardMatches(offer, cards) || !offer.bank) return null
  const needed = `${offer.bank}${offer.cardType ? ` ${offer.cardType}` : ''} card`
  const sameBank = cards.find((c) => c.bank.toLowerCase() === offer.bank!.toLowerCase())
  return sameBank
    ? `Needs an ${needed} — you have the ${offer.bank} ${sameBank.type} card`
    : `Needs a ${needed}, which you have not saved`
}

const DAY_MS = 86400000

/**
 * Calendar days (IST) from today to the offer's last day: 0 means it ends today, 2 means the
 * day after tomorrow. Negative once the last day has passed.
 */
export function daysUntil(validTill: string, now: Date): number {
  const end = Date.parse(toISTDateKey(validTill))
  const today = Date.parse(toISTDateKey(now))
  return Math.round((end - today) / DAY_MS)
}

/** An offer is live until the moment it ends. */
export function isLive(validFrom: string, validTill: string, now: Date): boolean {
  const t = now.getTime()
  return new Date(validFrom).getTime() <= t && new Date(validTill).getTime() > t
}

/** Offers ending within this many days are flagged "expiring soon". */
export const EXPIRING_SOON_DAYS = 3
