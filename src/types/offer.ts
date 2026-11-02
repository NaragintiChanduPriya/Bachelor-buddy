export type OfferKind = 'card' | 'coupon' | 'cashback'

export interface Offer {
  id: string
  kind: OfferKind
  title: string
  description: string
  platform: string
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
}

export interface OfferFilters {
  platform?: string
  card?: string
  expiringWithinDays?: number
}

export interface OfferApplication {
  offer: Offer
  originalPrice: number
  discount: number
  finalPrice: number
}
