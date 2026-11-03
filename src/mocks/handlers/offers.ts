import { http } from 'msw'
import { db } from '../db'
import { buildOffersResponse } from '../queries/offers'
import { badRequest, boolParam, numberParam, ok, stringParam, withMockBehaviour } from '../http'

export const offerHandlers = [
  http.get('*/offers', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const url = new URL(request.url)
    const platform = stringParam(url, 'platform')
    const card = stringParam(url, 'card')
    const expiringWithinDays = numberParam(url, 'expiringWithinDays')
    // Offers are filtered to the user's cards unless the caller asks to see everything.
    const eligibleOnly = boolParam(url, 'eligibleOnly') ?? true

    if (
      expiringWithinDays !== undefined &&
      (!Number.isInteger(expiringWithinDays) || expiringWithinDays < 0 || expiringWithinDays > 60)
    ) {
      return badRequest('expiringWithinDays must be a whole number from 0 to 60.')
    }
    if (card && !db.user.preferences.cards.some((c) => c.id === card)) {
      return badRequest(`"${card}" is not one of your saved cards.`)
    }

    return ok(buildOffersResponse({ platform, card, expiringWithinDays, eligibleOnly }))
  }),
]
