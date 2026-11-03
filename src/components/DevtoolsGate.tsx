import { lazy, Suspense } from 'react'

/** Query Devtools load only in development, so they never reach the production bundle. */
const Devtools = lazy(() =>
  import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
)

/**
 * Opt-in, even in development: the floating launcher otherwise sits on top of the app (it used
 * to cover the sidebar logo). Set VITE_QUERY_DEVTOOLS=true in .env.development.local to use it.
 */
export function DevtoolsGate() {
  if (!import.meta.env.DEV || import.meta.env.VITE_QUERY_DEVTOOLS !== 'true') return null
  return (
    <Suspense fallback={null}>
      <Devtools initialIsOpen={false} buttonPosition="bottom-left" />
    </Suspense>
  )
}
