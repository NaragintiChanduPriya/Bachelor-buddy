import { http } from 'msw'
import type { HomeType } from '@/types/home'
import { db } from '../db'
import { buildHomeSearchInsight } from '../calc/homes'
import { currentRentBudget, getHomeDetail, searchHomes } from '../queries/homes'
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

const homeTypes: HomeType[] = ['pg', 'coliving', 'sharedFlat']

/** Registered in this order so `/homes/search` is never swallowed by `/homes/:id`. */
export const homeHandlers = [
  http.get('*/homes/search', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const url = new URL(request.url)
    const area = stringParam(url, 'area')
    const type = stringParam(url, 'type')
    const techPark = stringParam(url, 'techPark')
    const maxRent = numberParam(url, 'maxRent')
    const maxDistanceKm = numberParam(url, 'maxDistanceKm')
    const foodIncluded = boolParam(url, 'foodIncluded')
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 12)

    if (type && !homeTypes.includes(type as HomeType)) {
      return badRequest(`Unknown home type "${type}". Use pg, coliving or sharedFlat.`)
    }
    if (area && !db.areas.some((a) => a.id === area)) {
      return badRequest(`Unknown area "${area}".`)
    }
    if (techPark && !db.techParks.some((p) => p.id === techPark)) {
      return badRequest(`Unknown tech park "${techPark}".`)
    }
    if (maxRent !== undefined && maxRent <= 0) {
      return badRequest('maxRent must be greater than zero.')
    }
    if (maxDistanceKm !== undefined && maxDistanceKm <= 0) {
      return badRequest('maxDistanceKm must be greater than zero.')
    }
    if (!Number.isInteger(page) || page < 1) {
      return badRequest('page must be a whole number of 1 or more.')
    }
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
      return badRequest('pageSize must be a whole number between 1 and 50.')
    }

    const results = searchHomes({
      area,
      type: type as HomeType | undefined,
      techPark,
      maxRent,
      maxDistanceKm,
      foodIncluded,
    })

    // The insight covers every match, not just this page, and is computed here rather than in
    // the component (money math belongs in the backend).
    const insight = buildHomeSearchInsight(results, currentRentBudget())
    const { slice, meta } = paginate(results, page, pageSize)
    return ok({ homes: slice, insight }, meta)
  }),

  http.get('*/homes/:id', async ({ params }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const home = getHomeDetail(String(params.id))
    if (!home) return notFound('Home')
    return ok(home)
  }),
]
