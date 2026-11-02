import { http } from 'msw'
import type { FoodListing, FoodPlaceType, FoodSort, NearAnchor } from '@/types/food'
import { db } from '../db'
import { compareDelivery } from '../calc/delivery'
import {
  badRequest,
  boolParam,
  notFound,
  numberParam,
  ok,
  paginate,
  stringParam,
  withMockBehaviour,
} from '../http'

const placeTypes: FoodPlaceType[] = ['darshini', 'mess', 'tiffin', 'restaurant']
const sorts: FoodSort[] = ['price', 'distance', 'rating']

/** Distance from whichever anchor the user is browsing around. */
function distanceFor(listing: FoodListing, near: NearAnchor): number {
  return near === 'office' ? listing.distanceFromOfficeKm : listing.distanceFromHomeKm
}

export const foodHandlers = [
  http.get('*/food/nearby', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const url = new URL(request.url)
    const area = stringParam(url, 'area')
    const nearRaw = stringParam(url, 'near') ?? 'home'
    const type = stringParam(url, 'type')
    const sort = stringParam(url, 'sort') ?? 'price'
    const maxPrice = numberParam(url, 'maxPrice')
    const veg = boolParam(url, 'veg')
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 12)

    if (nearRaw !== 'home' && nearRaw !== 'office') {
      return badRequest('The near parameter must be "home" or "office".')
    }
    if (type && !placeTypes.includes(type as FoodPlaceType)) {
      return badRequest(`Unknown food type "${type}".`)
    }
    if (!sorts.includes(sort as FoodSort)) {
      return badRequest(`Unknown sort "${sort}". Use price, distance or rating.`)
    }
    if (maxPrice !== undefined && maxPrice <= 0) {
      return badRequest('maxPrice must be greater than zero.')
    }
    if (area && !db.areas.some((a) => a.id === area)) {
      return badRequest(`Unknown area "${area}".`)
    }

    const near = nearRaw as NearAnchor
    let items = [...db.foodListings]

    if (area) items = items.filter((l) => l.areaId === area)
    if (type) items = items.filter((l) => l.type === type)
    if (veg === true) items = items.filter((l) => l.veg)
    if (maxPrice !== undefined) items = items.filter((l) => l.avgMealPrice <= maxPrice)

    switch (sort as FoodSort) {
      case 'price':
        items.sort((a, b) => a.avgMealPrice - b.avgMealPrice)
        break
      case 'distance':
        items.sort((a, b) => distanceFor(a, near) - distanceFor(b, near))
        break
      case 'rating':
        items.sort((a, b) => b.rating - a.rating)
        break
    }

    // Trust rule: a sponsored listing is labelled and never outranks a cheaper option, so it
    // keeps whatever position the honest sort gave it. No re-ranking happens here.

    const { slice, meta } = paginate(items, page, pageSize)

    // Summaries only — the full menu is served by GET /food/:id.
    const summaries = slice.map(({ menu: _menu, description: _d, address: _a, ...summary }) => summary)
    return ok(summaries, meta)
  }),

  http.get('*/food/:id/compare-delivery', async ({ params, request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const listing = db.foodListings.find((l) => l.id === String(params.id))
    if (!listing) return notFound('Food listing')
    if (!listing.deliveryAvailable) {
      return badRequest(`${listing.name} does not deliver, so there is nothing to compare.`)
    }

    const url = new URL(request.url)
    const dish = stringParam(url, 'dish')
    // Delivery is quoted to wherever the user is, which for a weekday lunch is the office.
    const distanceKm = listing.distanceFromOfficeKm

    return ok(compareDelivery(listing, dish, distanceKm))
  }),

  http.get('*/food/:id', async ({ params }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const listing = db.foodListings.find((l) => l.id === String(params.id))
    if (!listing) return notFound('Food listing')
    return ok(listing)
  }),
]
