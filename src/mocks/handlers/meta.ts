import { http } from 'msw'
import { db } from '../db'
import { ok, withMockBehaviour } from '../http'

export const metaHandlers = [
  http.get('*/meta/areas', async () => {
    const failure = await withMockBehaviour()
    if (failure) return failure
    return ok({ areas: db.areas, techParks: db.techParks })
  }),
]
