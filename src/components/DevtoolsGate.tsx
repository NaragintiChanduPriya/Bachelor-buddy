import { lazy, Suspense } from 'react'

/** Query Devtools load only in development, so they never reach the production bundle. */
const Devtools = lazy(() =>
  import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
)

export function DevtoolsGate() {
  if (!import.meta.env.DEV) return null
  return (
    <Suspense fallback={null}>
      <Devtools initialIsOpen={false} buttonPosition="top-left" />
    </Suspense>
  )
}
