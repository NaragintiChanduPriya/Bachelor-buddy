import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { ApiEnvelope, ApiErrorEnvelope, PaginationMeta } from '@/types/api'
import { ApiError } from './ApiError'

import { env } from '../env'

const baseURL = env.apiBaseUrl

export const axiosClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/** Auth header placeholder — the real backend will issue a bearer token at login. */
let authToken: string | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
}

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`
  return config
})

/** Meta from the most recent response, keyed by request id, so paginated calls can read it. */
const metaStore = new WeakMap<object, PaginationMeta | null>()

axiosClient.interceptors.response.use(
  (response: AxiosResponse<ApiEnvelope<unknown> | ApiErrorEnvelope>) => {
    const envelope = response.data
    if (envelope && typeof envelope === 'object' && 'success' in envelope) {
      if (!envelope.success) {
        const err = (envelope as ApiErrorEnvelope).error
        throw new ApiError(
          err?.code ?? 'SERVER_ERROR',
          err?.message ?? 'Something went wrong.',
          response.status,
          err?.details ?? null,
        )
      }
      const ok = envelope as ApiEnvelope<unknown>
      // Replace the body with the unwrapped payload, keeping meta reachable.
      response.data = ok.data as never
      metaStore.set(response, ok.meta ?? null)
      ;(response as AxiosResponse & { meta?: PaginationMeta | null }).meta = ok.meta ?? null
    }
    return response
  },
  (error: AxiosError<ApiErrorEnvelope>) => {
    if (error instanceof ApiError) throw error
    const status = error.response?.status ?? 0
    const payload = error.response?.data

    if (payload && typeof payload === 'object' && 'error' in payload && payload.error) {
      throw new ApiError(payload.error.code, payload.error.message, status, payload.error.details)
    }
    if (!error.response) {
      throw new ApiError(
        'NETWORK_ERROR',
        'Could not reach the server. Check your connection and try again.',
        0,
      )
    }
    if (status === 404) throw new ApiError('NOT_FOUND', 'We could not find that.', status)
    if (status === 400) throw new ApiError('BAD_REQUEST', 'That request was not valid.', status)
    throw new ApiError('SERVER_ERROR', 'Something went wrong on our side.', status)
  },
)

/** GET returning the unwrapped payload. */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await axiosClient.get<T>(url, { params })
  return response.data
}

/** GET for paginated endpoints: payload plus the envelope's meta. */
export async function apiGetPaginated<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<{ data: T; meta: PaginationMeta }> {
  const response = await axiosClient.get<T>(url, { params })
  const meta =
    (response as AxiosResponse<T> & { meta?: PaginationMeta | null }).meta ??
    ({ page: 1, pageSize: 0, total: 0 } satisfies PaginationMeta)
  return { data: response.data, meta }
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const response = await axiosClient.post<T>(url, body)
  return response.data
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const response = await axiosClient.put<T>(url, body)
  return response.data
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const response = await axiosClient.patch<T>(url, body)
  return response.data
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await axiosClient.delete<T>(url)
  return response.data
}
