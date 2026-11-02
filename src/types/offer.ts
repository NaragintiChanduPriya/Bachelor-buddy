export type OfferKind = 'card' | 'coupon' | 'cashback'

/** What the platform sells, so offers can be grouped: shopping, food delivery or groceries. */
export type OfferPlatformCategory = 'shopping' | 'food' | 'groceries'

/** A worked example of the offer on a typical order, computed by the backend. */
export interface OfferExample {
  orderValue: number
  discount: number
  finalPrice: number
  /** The discount as a share of the order after the cap, which is often below the headline %. */
  effectivePercent: number
}

export interface Offer {
  id: string
  kind: OfferKind
  title: string
  description: string
  platform: string
  platformCategory: OfferPlatformCategory
  bank: string | null
  cardType: 'credit' | 'debit' | null
  code: string | null
  discountPercent: number | null
  flatDiscount: number | null
  maxDiscount: number | null
  minOrderValue: number
  validFrom: string
  validTill: string
  expiringSoon: boolean
  daysLeft: number
  eligible: boolean
  /** Why the user cannot use it, e.g. "Needs a Kotak credit card". Null when eligible. */
  ineligibleReason: string | null
  example: OfferExample
}

export interface OfferFilters {
  platform?: string
  /** A saved card id, e.g. `card_hdfc_cc`; keeps only offers usable with that card. */
  card?: string
  expiringWithinDays?: number
  /** Defaults to true: only offers the user's saved cards (or no card) can unlock. */
  eligibleOnly?: boolean
}

/** GET /offers payload: the filtered offers plus counts across everything currently live. */
export interface OffersResponse {
  offers: Offer[]
  /** Live offers in total, usable or not. */
  totalCount: number
  /** Live offers the user's saved cards (or no card) can unlock. */
  eligibleCount: number
  /** Usable offers ending within 3 days. */
  expiringSoonCount: number
  /** The biggest worked-example discount among usable offers. */
  biggestExampleSaving: number
}

export interface OfferApplication {
  offer: Offer
  originalPrice: number
  discount: number
  finalPrice: number
}
