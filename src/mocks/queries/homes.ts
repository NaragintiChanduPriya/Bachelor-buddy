import type {
  CommuteInfo,
  HomeDetail,
  HomeFilters,
  HomeSummary,
  HomeType,
  SharingType,
} from '@/types/home'
import { bikeMinutes, busMinutes, haversineKm } from '@/utils/distance'
import { db } from '../db'
import { daysAgo, daysAhead } from '../clock'
import { hashSeed, randomFloat, randomInt, seededFrom } from '../random'
import { areaAverageRents, homeSeeds, type HomeSeed } from '../fixtures/homes'
import {
  compareWithAreaAverage,
  differenceFromRentBudget,
  moveInCost,
  yearlyDifference,
} from '../calc/homes'

/**
 * Database queries for homes, shared by the /homes handlers and the chat Home agent so both
 * always return the same listings in the same order.
 */

const typeLabels: Record<HomeType, string> = {
  pg: 'PG',
  coliving: 'Co-living',
  sharedFlat: 'Shared flat',
}

function sharingLabelFor(type: HomeType, sharing: SharingType): string {
  if (type === 'sharedFlat') {
    if (sharing === 'single') return 'Private room'
    if (sharing === 'entireFlat') return 'Entire flat'
    return 'Shared room'
  }
  switch (sharing) {
    case 'single':
      return 'Single room'
    case 'double':
      return 'Double sharing'
    case 'triple':
      return 'Triple sharing'
    case 'entireFlat':
      return 'Entire flat'
  }
}

/** Roads are not straight lines; about 1.35× the crow-flies distance is typical in Bangalore. */
const ROAD_FACTOR = 1.35

/** The parts of a listing that do not depend on who is asking. */
type HomeRecord = Omit<
  HomeDetail,
  'techParkDistanceKm' | 'techParkName' | 'rentBudget' | 'differenceFromRentBudget'
>

function buildRecord(seed: HomeSeed): HomeRecord {
  const rand = seededFrom(seed.id)
  const area = db.areas.find((a) => a.id === seed.areaId)
  if (!area) throw new Error(`Home ${seed.id} references unknown area ${seed.areaId}`)

  const commutes: CommuteInfo[] = db.techParks
    .map((park) => {
      const parkRand = seededFrom(`${seed.id}:${park.id}`)
      const roadKm = haversineKm(area, park) * ROAD_FACTOR + randomFloat(parkRand, -0.2, 0.6, 1)
      const distanceKm = Math.max(0.5, Math.round(roadKm * 10) / 10)
      return {
        techParkId: park.id,
        techParkName: park.name,
        techParkAreaName: park.areaName,
        distanceKm,
        bikeMinutes: bikeMinutes(distanceKm),
        busMinutes: busMinutes(distanceKm),
      }
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)

  const nearest = commutes[0]!
  const average = areaAverageRents[seed.areaId]?.[seed.type] ?? seed.rent
  const comparison = compareWithAreaAverage(seed.rent, average)
  const availableNow = seed.availableInDays <= 0

  return {
    id: seed.id,
    name: seed.name,
    type: seed.type,
    typeLabel: typeLabels[seed.type],
    areaId: area.id,
    areaName: area.name,
    rent: seed.rent,
    deposit: seed.deposit,
    sharing: seed.sharing,
    sharingLabel: sharingLabelFor(seed.type, seed.sharing),
    foodIncluded: seed.foodIncluded,
    bachelorFriendly: seed.bachelorFriendly,
    ...comparison,
    nearestTechParkKm: nearest.distanceKm,
    nearestTechParkName: nearest.techParkName,
    rating: randomFloat(rand, 3.7, 4.7, 1),
    reviewCount: randomInt(rand, 24, 480),
    thumbnailSeed: hashSeed(seed.id) % 360,
    sponsored: seed.sponsored,
    description: seed.description,
    address: `${seed.locality}, ${area.name}, Bengaluru`,
    amenities: seed.amenities,
    foodDetails: seed.foodDetails,
    mealsPerDay: seed.mealsPerDay,
    noticePeriodDays: seed.noticePeriodDays,
    maintenanceIncluded: seed.maintenanceIncluded,
    commutes,
    availableFrom: availableNow ? daysAgo(3, 10) : daysAhead(seed.availableInDays, 10),
    availableNow,
    moveInCost: moveInCost(seed.rent, seed.deposit),
    yearlyDifferenceFromAverage: yearlyDifference(comparison.differenceFromAverage),
  }
}

let records: HomeRecord[] | null = null

/** Built once on first use: the listings are static and the mock clock never moves. */
function allHomes(): HomeRecord[] {
  if (!records) records = homeSeeds.map(buildRecord)
  return records
}

/** The user's monthly rent budget, read live so a budget edit changes the comparison. */
export function currentRentBudget(): number {
  return db.budgetLimits.rent
}

/** The tech park distances are measured to: the one asked for, else the user's own. */
function referencePark(techPark: string | undefined): string | null {
  return techPark ?? db.user.preferences.techParkId ?? null
}

function toSummary(record: HomeRecord, parkId: string | null): HomeSummary {
  const anchor = parkId ? record.commutes.find((c) => c.techParkId === parkId) : undefined
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    typeLabel: record.typeLabel,
    areaId: record.areaId,
    areaName: record.areaName,
    rent: record.rent,
    deposit: record.deposit,
    sharing: record.sharing,
    sharingLabel: record.sharingLabel,
    foodIncluded: record.foodIncluded,
    bachelorFriendly: record.bachelorFriendly,
    areaAverageRent: record.areaAverageRent,
    differenceFromAverage: record.differenceFromAverage,
    belowAverage: record.belowAverage,
    nearestTechParkKm: record.nearestTechParkKm,
    nearestTechParkName: record.nearestTechParkName,
    techParkDistanceKm: anchor?.distanceKm ?? null,
    techParkName: anchor?.techParkName ?? null,
    rating: record.rating,
    reviewCount: record.reviewCount,
    thumbnailSeed: record.thumbnailSeed,
    sponsored: record.sponsored,
  }
}

/**
 * Filtered and sorted, unpaginated. Cheapest first with rating breaking ties. Trust rule: a
 * sponsored listing keeps whatever position the honest sort gives it and is never lifted.
 */
export function searchHomes(filters: HomeFilters): HomeSummary[] {
  const parkId = referencePark(filters.techPark)
  const { area, type, maxRent, foodIncluded, maxDistanceKm } = filters

  let items = allHomes()
  if (area) items = items.filter((h) => h.areaId === area)
  if (type && type !== 'all') items = items.filter((h) => h.type === type)
  if (maxRent !== undefined) items = items.filter((h) => h.rent <= maxRent)
  if (foodIncluded !== undefined) items = items.filter((h) => h.foodIncluded === foodIncluded)

  let summaries = items.map((record) => toSummary(record, parkId))
  if (maxDistanceKm !== undefined) {
    summaries = summaries.filter(
      (h) => (h.techParkDistanceKm ?? h.nearestTechParkKm) <= maxDistanceKm,
    )
  }

  return summaries.sort((a, b) => a.rent - b.rent || b.rating - a.rating)
}

export function getHomeDetail(id: string): HomeDetail | null {
  const record = allHomes().find((h) => h.id === id)
  if (!record) return null

  const summary = toSummary(record, referencePark(undefined))
  const rentBudget = currentRentBudget()
  return {
    ...record,
    techParkDistanceKm: summary.techParkDistanceKm,
    techParkName: summary.techParkName,
    rentBudget,
    differenceFromRentBudget: differenceFromRentBudget(record.rent, rentBudget),
  }
}
