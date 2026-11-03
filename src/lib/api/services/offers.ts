import { apiGet } from '../client'
import type { OfferFilters, OffersResponse } from '@/types/offer'

export const offerService = {
  list: (filters: OfferFilters) =>
    apiGet<OffersResponse>('/offers', {
      platform: filters.platform || undefined,
      card: filters.card || undefined,
      expiringWithinDays: filters.expiringWithinDays,
      // The server defaults to the user's cards; only send the flag to widen it.
      eligibleOnly: filters.eligibleOnly === false ? 'false' : undefined,
    }),
}
