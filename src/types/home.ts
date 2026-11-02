export type HomeType = 'pg' | 'coliving' | 'sharedFlat'
export type SharingType = 'single' | 'double' | 'triple' | 'entireFlat'

export interface CommuteInfo {
  techParkId: string
  techParkName: string
  distanceKm: number
  bikeMinutes: number
  busMinutes: number
}

export interface HomeSummary {
  id: string
  name: string
  type: HomeType
  typeLabel: string
  areaId: string
  areaName: string
  rent: number
  deposit: number
  sharing: SharingType
  sharingLabel: string
  foodIncluded: boolean
  bachelorFriendly: boolean
  areaAverageRent: number
  differenceFromAverage: number
  belowAverage: boolean
  nearestTechParkKm: number
  rating: number
  reviewCount: number
  thumbnailSeed: number
  sponsored: boolean
}

export interface HomeDetail extends HomeSummary {
  description: string
  address: string
  amenities: string[]
  foodDetails: string | null
  mealsPerDay: number | null
  noticePeriodDays: number
  maintenanceIncluded: boolean
  commutes: CommuteInfo[]
  availableFrom: string
}

export interface HomeFilters {
  area?: string
  maxRent?: number
  type?: HomeType | 'all'
  foodIncluded?: boolean
  maxDistanceKm?: number
  techPark?: string
  page?: number
  pageSize?: number
}
