import type { ApiErrorCode } from '@/types/api'

/** Normalized error thrown by the API client for every failure path. */
export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number
  readonly details: unknown

  constructor(code: ApiErrorCode, message: string, status: number, details: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }

  get isNetwork(): boolean {
    return this.code === 'NETWORK_ERROR'
  }

  get isNotFound(): boolean {
    return this.code === 'NOT_FOUND'
  }

  /** Retrying a 404 or a validation failure will not help. */
  get isRetryable(): boolean {
    return this.code === 'NETWORK_ERROR' || this.code === 'SERVER_ERROR'
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
