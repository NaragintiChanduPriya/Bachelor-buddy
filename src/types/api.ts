/** Standard response envelope used by every endpoint. */
export interface ApiEnvelope<T> {
  success: true
  data: T
  meta: PaginationMeta | null
  error: null
}

export interface ApiErrorEnvelope {
  success: false
  data: null
  meta: null
  error: { code: ApiErrorCode; message: string; details: unknown }
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
}

export type ApiErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'BAD_REQUEST'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'

/** A paginated result as the services hand it to the hooks. */
export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}
