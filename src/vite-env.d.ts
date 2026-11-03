/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_MOCKING: 'enabled' | 'disabled'
  readonly VITE_MOCK_FAILURE_RATE: string
  /** "true" shows the TanStack Query Devtools launcher in development. Off by default. */
  readonly VITE_QUERY_DEVTOOLS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
