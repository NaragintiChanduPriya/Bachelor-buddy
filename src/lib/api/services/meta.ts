import { apiGet } from '../client'
import type { AreasResponse } from '@/types/meta'

export const metaService = {
  getAreas: () => apiGet<AreasResponse>('/meta/areas'),
}
