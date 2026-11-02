import type { Offer } from '@/types/offer'
import { formatINR } from './currency'

/** The headline terms, e.g. "10% off up to ₹500" or "₹100 off". Formatting only. */
export function offerHeadline(offer: Offer): string {
  if (offer.discountPercent !== null) {
    return offer.maxDiscount !== null
      ? `${offer.discountPercent}% off up to ${formatINR(offer.maxDiscount)}`
      : `${offer.discountPercent}% off`
  }
  if (offer.flatDiscount !== null) return `${formatINR(offer.flatDiscount)} off`
  return offer.title
}

export function daysLeftLabel(daysLeft: number): string {
  if (daysLeft <= 0) return 'Ends today'
  if (daysLeft === 1) return '1 day left'
  return `${daysLeft} days left`
}
