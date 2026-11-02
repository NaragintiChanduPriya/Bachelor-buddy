import type { FoodListing, FoodPlaceType, MenuItem } from '@/types/food'
import { haversineKm } from '@/utils/distance'
import { seededFrom, randomFloat, randomInt } from '../random'
import { findArea } from './areas'
import { foodSeeds, type FoodSeed } from './foodSeeds'
import {
  buildMenu,
  cafeMenu,
  darshiniMenu,
  messMenu,
  messNonVegMenu,
  restaurantMenu,
  tiffinMenu,
  type MenuTemplate,
} from './foodMenus'

/** Where the demo user lives and works; distances are measured from these. */
const HOME_AREA_ID = 'area_hsr'
const OFFICE_AREA_ID = 'area_bellandur'

function templatesFor(seed: FoodSeed): MenuTemplate[] {
  switch (seed.type) {
    case 'darshini':
      return darshiniMenu
    case 'tiffin':
      return tiffinMenu
    case 'mess':
      return seed.veg ? messMenu : messNonVegMenu
    case 'restaurant':
      return seed.tags.includes('Cafe') ? cafeMenu : restaurantMenu
  }
}

/**
 * A tiffin service sells monthly plans, so its "meal price" is the plan divided by the meals
 * it covers. Everything else is priced per dish.
 */
function priceStats(menu: MenuItem[], type: FoodPlaceType) {
  const perMeal =
    type === 'tiffin'
      ? menu
          .filter((item) => item.name.includes('Monthly lunch plan'))
          .map((item) => Math.round(item.price / 26))
      : []

  const dishPrices =
    type === 'tiffin'
      ? menu.filter((item) => !item.name.startsWith('Monthly')).map((item) => item.price)
      : menu.map((item) => item.price)

  const pool = dishPrices.length > 0 ? dishPrices : menu.map((item) => item.price)
  const priceMin = Math.min(...pool)
  const priceMax = Math.max(...pool)

  // The headline "average meal" number used for sorting and the max-price filter.
  const mains = menu.filter((item) => item.popular && !item.name.startsWith('Monthly'))
  const avgMealPrice =
    perMeal.length > 0
      ? perMeal[0]!
      : mains.length > 0
        ? Math.round(mains.reduce((sum, item) => sum + item.price, 0) / mains.length)
        : Math.round((priceMin + priceMax) / 2)

  return { priceMin, priceMax, avgMealPrice }
}

function monthlyPlanPrice(menu: MenuItem[], type: FoodPlaceType): number | null {
  if (type !== 'tiffin') return null
  const plan = menu.find((item) => item.name.includes('Monthly lunch plan'))
  return plan?.price ?? null
}

/** Is the place open at the mock clock's hour (12:30 PM IST)? */
function isOpenAt(seed: FoodSeed, hour: number, minute: number): boolean {
  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number)
    return (h ?? 0) * 60 + (m ?? 0)
  }
  const now = hour * 60 + minute
  const open = toMinutes(seed.openingTime)
  const close = toMinutes(seed.closingTime)
  // A closing time past midnight (e.g. 01:00) wraps around.
  return close < open ? now >= open || now <= close : now >= open && now <= close
}

export function generateFoodListings(): FoodListing[] {
  const home = findArea(HOME_AREA_ID)!
  const office = findArea(OFFICE_AREA_ID)!

  return foodSeeds.map((seed) => {
    const rand = seededFrom(seed.id)
    const area = findArea(seed.areaId)!
    const menu = buildMenu(templatesFor(seed), seed.id, seed.priceOffset)
    const { priceMin, priceMax, avgMealPrice } = priceStats(menu, seed.type)

    // Distance is area-to-area plus a small seeded offset, so two places in the same area
    // are not identical but stay plausible for the real geography.
    const jitter = () => randomFloat(rand, -0.4, 0.6, 1)
    const distanceFromHomeKm = Math.max(0.3, Math.round((haversineKm(home, area) + jitter()) * 10) / 10)
    const distanceFromOfficeKm = Math.max(
      0.3,
      Math.round((haversineKm(office, area) + jitter()) * 10) / 10,
    )

    return {
      id: seed.id,
      name: seed.name,
      type: seed.type,
      areaId: seed.areaId,
      areaName: area.name,
      veg: seed.veg,
      rating: randomFloat(rand, 3.6, 4.8, 1),
      reviewCount: randomInt(rand, 48, 1840),
      priceMin,
      priceMax,
      avgMealPrice,
      distanceFromHomeKm,
      distanceFromOfficeKm,
      tags: seed.tags,
      openNow: isOpenAt(seed, 12, 30),
      timings: `${seed.openingTime} – ${seed.closingTime}`,
      thumbnailSeed: randomInt(rand, 1, 9999),
      sponsored: seed.sponsored ?? false,
      monthlyPlanPrice: monthlyPlanPrice(menu, seed.type),
      description: seed.description,
      address: seed.address,
      menu,
      openingTime: seed.openingTime,
      closingTime: seed.closingTime,
      deliveryAvailable: seed.deliveryAvailable,
    }
  })
}
