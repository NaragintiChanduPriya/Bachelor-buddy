import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { offerService } from '@/lib/api/services/offers'
import { offerKeys } from '@/lib/api/queryKeys'
import type { OfferFilters } from '@/types/offer'

export function useOffers(filters: OfferFilters) {
  return useQuery({
    queryKey: offerKeys.list(filters),
    queryFn: () => offerService.list(filters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}
