import type { HomeSearchInsight, HomeSummary } from '@/types/home'

/**
 * Money math for the Home agent. Pure functions only: the real backend reimplements these,
 * and the UI never does this arithmetic itself.
 */

export interface AreaAverageComparison {
  areaAverageRent: number
  /** rent − areaAverageRent; negative means cheaper than the area. */
  differenceFromAverage: number
  belowAverage: boolean
}

/** How a listing's rent sits against the market average for its area and type. */
export function compareWithAreaAverage(rent: number, areaAverageRent: number): AreaAverageComparison {
  const differenceFromAverage = rent - areaAverageRent
  return {
    areaAverageRent,
    differenceFromAverage,
    belowAverage: differenceFromAverage < 0,
  }
}

/** A monthly difference over a year, which is how most people feel a rent gap. */
export function yearlyDifference(monthlyDifference: number): number {
  return monthlyDifference * 12
}

/** What it costs to move in: the first month's rent plus the deposit. */
export function moveInCost(rent: number, deposit: number): number {
  return rent + deposit
}

/** rent − rentBudget; negative means the place fits inside the user's rent budget. */
export function differenceFromRentBudget(rent: number, rentBudget: number): number {
  return rent - rentBudget
}

/**
 * Summary across every home matching a search, so the page can say "the cheapest saves you
 * ₹X a month" without adding anything up itself. Sponsored listings count like any other.
 */
export function buildHomeSearchInsight(
  homes: Array<Pick<HomeSummary, 'id' | 'name' | 'rent' | 'belowAverage'>>,
  rentBudget: number,
): HomeSearchInsight {
  const cheapest = homes.reduce<(typeof homes)[number] | null>(
    (best, home) => (!best || home.rent < best.rent ? home : best),
    null,
  )
  const totalRent = homes.reduce((sum, home) => sum + home.rent, 0)
  const monthlySaving = cheapest ? Math.max(0, rentBudget - cheapest.rent) : 0

  return {
    rentBudget,
    matchCount: homes.length,
    withinBudgetCount: homes.filter((home) => home.rent <= rentBudget).length,
    belowAverageCount: homes.filter((home) => home.belowAverage).length,
    averageRent: homes.length > 0 ? Math.round(totalRent / homes.length) : null,
    cheapestHomeId: cheapest?.id ?? null,
    cheapestHomeName: cheapest?.name ?? null,
    cheapestRent: cheapest?.rent ?? null,
    monthlySavingVsBudget: monthlySaving,
    yearlySavingVsBudget: yearlyDifference(monthlySaving),
  }
}
