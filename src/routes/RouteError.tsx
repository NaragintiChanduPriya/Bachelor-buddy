import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { Button } from '@/components/ui/button'
import { SeoTitle } from '@/components/SeoTitle'

/** errorElement for every route branch. */
export function RouteError() {
  const error = useRouteError()
  const navigate = useNavigate()

  const title = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : 'This page hit a snag'

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-16">
      <SeoTitle title="Error" />
      <ErrorState error={error} title={title} onRetry={() => navigate(0)} className="w-full" />
      <Button variant="ghost" onClick={() => navigate('/')}>
        Back to dashboard
      </Button>
    </div>
  )
}
