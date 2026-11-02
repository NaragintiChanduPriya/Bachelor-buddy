import { HttpResponse, delay } from 'msw'
import type { ApiErrorCode, PaginationMeta } from '@/types/api'

/** Handlers mimic a real network: 300-900 ms, and a small random failure rate. */
export async function mockLatency(): Promise<void> {
  await delay(300 + Math.floor(Math.random() * 600))
}

function failureRate(): number {
  const raw = import.meta.env.VITE_MOCK_FAILURE_RATE
  const parsed = raw === undefined ? 0.03 : Number.parseFloat(raw)
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0.03
}

/** Uses Math.random, never the seeded generator, so toggling this never shifts fixtures. */
export function shouldRandomlyFail(): boolean {
  return Math.random() < failureRate()
}

export function ok<T>(data: T, meta: PaginationMeta | null = null) {
  return HttpResponse.json({ success: true, data, meta, error: null })
}

const statusFor: Record<ApiErrorCode, number> = {
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  BAD_REQUEST: 400,
  CONFLICT: 409,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 503,
}

export function fail(code: ApiErrorCode, message: string, details: unknown = null) {
  return HttpResponse.json(
    { success: false, data: null, meta: null, error: { code, message, details } },
    { status: statusFor[code] },
  )
}

export function notFound(what: string) {
  return fail('NOT_FOUND', `${what} was not found.`)
}

export function badRequest(message: string, details: unknown = null) {
  return fail('BAD_REQUEST', message, details)
}

export function validationError(message: string, details: unknown = null) {
  return fail('VALIDATION_ERROR', message, details)
}

/** Every read handler starts with this: latency, then the random failure roll. */
export async function withMockBehaviour(): Promise<ReturnType<typeof fail> | null> {
  await mockLatency()
  if (shouldRandomlyFail()) {
    return fail('SERVER_ERROR', 'The service is temporarily unavailable. Please try again.')
  }
  return null
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): { slice: T[]; meta: PaginationMeta } {
  const safePage = Math.max(1, Math.floor(page) || 1)
  const safeSize = Math.max(1, Math.floor(pageSize) || 12)
  const start = (safePage - 1) * safeSize
  return {
    slice: items.slice(start, start + safeSize),
    meta: { page: safePage, pageSize: safeSize, total: items.length },
  }
}

export function numberParam(url: URL, key: string): number | undefined {
  const raw = url.searchParams.get(key)
  if (raw === null || raw === '') return undefined
  const value = Number.parseFloat(raw)
  return Number.isFinite(value) ? value : undefined
}

export function boolParam(url: URL, key: string): boolean | undefined {
  const raw = url.searchParams.get(key)
  if (raw === null || raw === '') return undefined
  return raw === 'true' || raw === '1'
}

export function stringParam(url: URL, key: string): string | undefined {
  const raw = url.searchParams.get(key)
  return raw === null || raw === '' || raw === 'all' ? undefined : raw
}
