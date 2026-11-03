import type { Offer, OfferFilters, OffersResponse } from '@/types/offer'
import { db } from '../db'
import { mockNow } from '../clock'
import {
  EXPIRING_SOON_DAYS,
  buildOfferExample,
  cardMatches,
  daysUntil,
  ineligibleReason,
  isLive,
} from '../calc/offers'
import { offerRecords, typicalOrderValue, type OfferRecord } from '../fixtures/offers'

/** Turns stored terms into the API shape for the current user and the mock clock. */
function toOffer(record: OfferRecord): Offer {
  const cards = db.user.preferences.cards
  const daysLeft = daysUntil(record.validTill, mockNow())
  // The example uses a typical basket, raised to the minimum order when that is higher.
  const orderValue = Math.max(typicalOrderValue[record.platformCategory], record.minOrderValue)

  return {
    ...record,
    daysLeft: Math.max(0, daysLeft),
    expiringSoon: daysLeft <= EXPIRING_SOON_DAYS,
    eligible: cardMatches(record, cards),
    ineligibleReason: ineligibleReason(record, cards),
    example: buildOfferExample(orderValue, record),
  }
}

/** Every offer still running, soonest-ending first, then by what it is worth. */
function liveOffers(): Offer[] {
  const now = mockNow()
  return offerRecords
    .filter((record) => isLive(record.validFrom, record.validTill, now))
    .map(toOffer)
    .sort((a, b) => a.daysLeft - b.daysLeft || b.example.discount - a.example.discount)
}

/**
 * The offer list used by GET /offers, product pages and the chat agent. By default only offers
 * the user can actually use are returned; `eligibleOnly: false` includes the rest, each with
 * the reason it is out of reach.
 */
export function listOffers(filters: OfferFilters & { eligibleOnly?: boolean } = {}): Offer[] {
  const eligibleOnly = filters.eligibleOnly ?? true
  let offers = liveOffers()

  if (eligibleOnly) offers = offers.filter((offer) => offer.eligible)
  if (filters.platform) {
    const platform = filters.platform.toLowerCase()
    offers = offers.filter((offer) => offer.platform.toLowerCase() === platform)
  }
  if (filters.card) {
    const card = db.user.preferences.cards.find((c) => c.id === filters.card)
    offers = card ? offers.filter((offer) => offer.bank !== null && cardMatches(offer, [card])) : []
  }
  if (filters.expiringWithinDays !== undefined) {
    const within = filters.expiringWithinDays
    offers = offers.filter((offer) => offer.daysLeft <= within)
  }
  return offers
}

/** GET /offers payload: the filtered list plus headline counts across all live offers. */
export function buildOffersResponse(
  filters: OfferFilters & { eligibleOnly?: boolean },
): OffersResponse {
  const all = liveOffers()
  const usable = all.filter((offer) => offer.eligible)
  return {
    offers: listOffers(filters),
    totalCount: all.length,
    eligibleCount: usable.length,
    expiringSoonCount: usable.filter((offer) => offer.expiringSoon).length,
    biggestExampleSaving: usable.reduce((max, offer) => Math.max(max, offer.example.discount), 0),
  }
}
