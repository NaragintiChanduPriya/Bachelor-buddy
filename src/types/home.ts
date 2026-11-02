export type HomeType = 'pg' | 'coliving' | 'sharedFlat'
export type SharingType = 'single' | 'double' | 'triple' | 'entireFlat'

export interface CommuteInfo {
  techParkId: string
  techParkName: string
  techParkAreaName: string
  distanceKm: number
  bikeMinutes: number
  busMinutes: number
}

/** All money values are integer rupees per person per month, computed by the backend. */
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
  /** rent − areaAverageRent; negative means cheaper than the area. */
  differenceFromAverage: number
  belowAverage: boolean
  nearestTechParkKm: number
  nearestTechParkName: string
  /** Distance to the tech park the search was anchored on (the query's or the user's). */
  techParkDistanceKm: number | null
  techParkName: string | null
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
  availableNow: boolean
  /** First month's rent plus the deposit. */
  moveInCost: number
  /** differenceFromAverage over twelve months. */
  yearlyDifferenceFromAverage: number
  /** The user's current monthly rent budget (the budget's rent category limit). */
  rentBudget: number
  /** rent − rentBudget; negative means it fits inside the budget. */
  differenceFromRentBudget: number
}

/** Computed across every home matching the filters, not just the current page. */
export interface HomeSearchInsight {
  rentBudget: number
  matchCount: number
  withinBudgetCount: number
  belowAverageCount: number
  averageRent: number | null
  cheapestHomeId: string | null
  cheapestHomeName: string | null
  cheapestRent: number | null
  /** rentBudget − cheapestRent, never below zero. */
  monthlySavingVsBudget: number
  yearlySavingVsBudget: number
}

/** GET /homes/search payload: the page of homes plus the insight across the whole filter. */
export interface HomeSearchResponse {
  homes: HomeSummary[]
  insight: HomeSearchInsight
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
