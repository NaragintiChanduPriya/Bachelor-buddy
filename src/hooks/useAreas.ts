import { useQuery } from '@tanstack/react-query'
import { metaService } from '@/lib/api/services/meta'
import { metaKeys } from '@/lib/api/queryKeys'

/** Areas and tech parks change rarely, so they stay fresh for the session. */
export function useAreas() {
  return useQuery({
    queryKey: metaKeys.areas(),
    queryFn: metaService.getAreas,
    staleTime: Infinity,
  })
}
