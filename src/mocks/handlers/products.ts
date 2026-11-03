import { http } from 'msw'
import type { ProductCategory, ProductSort, SetPriceAlertRequest } from '@/types/product'
import { productCategoryIds } from '@/features/shop/utils/productCategories'
import { db, nextId, persistDb } from '../db'
import { nowISO } from '../clock'
import { HISTORY_DAYS } from '../fixtures/priceHistory'
import { findProductRecord } from '../fixtures/products'
import {
  getPriceHistory,
  getProductDetail,
  listPriceAlerts,
  searchProducts,
  toPriceAlert,
  toProductSummary,
} from '../queries/products'
import {
  badRequest,
  notFound,
  numberParam,
  ok,
  paginate,
  stringParam,
  validationError,
  withMockBehaviour,
} from '../http'
import { formatINR } from '@/utils/currency'

const sorts: ProductSort[] = ['price', 'rating', 'discount']

/** Registered before `/products/:id` so "search" and "alerts" are never read as an id. */
export const productHandlers = [
  http.get('*/products/search', async ({ request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.trim() ?? ''
    const category = stringParam(url, 'category')
    const sort = stringParam(url, 'sort') ?? 'price'
    const maxPrice = numberParam(url, 'maxPrice')
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 12)

    if (q.length > 80) return badRequest('Keep the search under 80 characters.')
    if (category && !productCategoryIds.includes(category as ProductCategory)) {
      return badRequest(`Unknown category "${category}".`)
    }
    if (!sorts.includes(sort as ProductSort)) {
      return badRequest(`Unknown sort "${sort}". Use price, rating or discount.`)
    }
    if (maxPrice !== undefined && maxPrice <= 0) {
      return badRequest('maxPrice must be greater than zero.')
    }

    const items = searchProducts({
      q,
      category: category as ProductCategory | undefined,
      maxPrice,
      sort: sort as ProductSort,
    })
    const { slice, meta } = paginate(items, page, pageSize)
    return ok(slice, meta)
  }),

  http.get('*/products/alerts', async () => {
    const failure = await withMockBehaviour()
    if (failure) return failure
    return ok(listPriceAlerts())
  }),

  http.get('*/products/:id/price-history', async ({ params, request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const url = new URL(request.url)
    const days = Number(url.searchParams.get('days') ?? HISTORY_DAYS)
    if (!Number.isInteger(days) || days < 7 || days > HISTORY_DAYS) {
      return badRequest(`The days parameter must be a whole number from 7 to ${HISTORY_DAYS}.`)
    }

    const history = getPriceHistory(String(params.id), days)
    if (!history) return notFound('Product')
    return ok(history)
  }),

  http.post('*/products/:id/price-alert', async ({ params, request }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const productId = String(params.id)
    const record = findProductRecord(productId)
    if (!record) return notFound('Product')

    const body = (await request.json()) as Partial<SetPriceAlertRequest>
    const target = body.targetPrice
    if (typeof target !== 'number' || !Number.isInteger(target) || target <= 0) {
      return validationError('Enter a target price in whole rupees greater than zero.')
    }

    const current = toProductSummary(record).lowestPrice
    if (target >= current) {
      return validationError(
        `Set a target below today's lowest price of ${formatINR(current)} — at that price you could buy it now.`,
        { currentPrice: current },
      )
    }

    // One alert per product: setting it again moves the target.
    const existing = db.priceAlerts.find((a) => a.productId === productId)
    if (existing) {
      existing.targetPrice = target
    } else {
      db.priceAlerts.push({
        id: nextId('alert'),
        productId,
        targetPrice: target,
        createdAt: nowISO(),
      })
    }
    persistDb()

    const saved = db.priceAlerts.find((a) => a.productId === productId)!
    return ok(toPriceAlert(saved))
  }),

  http.delete('*/products/:id/price-alert', async ({ params }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const productId = String(params.id)
    const index = db.priceAlerts.findIndex((a) => a.productId === productId)
    if (index === -1) return notFound('Price alert')

    db.priceAlerts.splice(index, 1)
    persistDb()
    return ok({ productId })
  }),

  http.get('*/products/:id', async ({ params }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const detail = getProductDetail(String(params.id))
    if (!detail) return notFound('Product')
    return ok(detail)
  }),
]
