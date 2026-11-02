import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useMe } from '@/hooks/useMe'
import { useSessionStore } from '@/store/sessionStore'
import { PageSkeleton } from '@/components/PageSkeleton'
import { ErrorState } from '@/components/ErrorState'

/**
 * Guards the app shell. The server's `/me` is authoritative; the session store mirrors it so
 * a reload does not flash the onboarding screen before the query resolves.
 */
export function RequireOnboarding() {
  const { data: user, isPending, isError, error, refetch } = useMe()
  const onboarded = useSessionStore((s) => s.onboarded)
  const setOnboarded = useSessionStore((s) => s.setOnboarded)

  useEffect(() => {
    if (user) setOnboarded(user.onboarded)
  }, [user, setOnboarded])

  // No cached answer yet and no server answer yet — wait rather than guess.
  if (isPending && !onboarded) return <PageSkeleton />

  if (isError && !onboarded) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <ErrorState
          error={error}
          title="We could not load your profile"
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  if (user && !user.onboarded) return <Navigate to="/onboarding" replace />

  return <Outlet />
}
