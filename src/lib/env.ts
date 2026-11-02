/**
 * Typed access to the build-time environment. Lives outside src/mocks/ so components can ask
 * whether the app is running against the mock backend without importing mock internals.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  mocking: import.meta.env.VITE_API_MOCKING === 'enabled',
} as const

/** True when MSW is serving the API, which is when demo-only affordances make sense. */
export function isMockMode(): boolean {
  return env.mocking
}
