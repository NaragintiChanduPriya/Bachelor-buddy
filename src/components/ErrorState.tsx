import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isApiError } from '@/lib/api/ApiError'
import { cn } from '@/utils/cn'

export interface ErrorStateProps {
  error?: unknown
  title?: string
  onRetry?: () => void
  className?: string
}

function messageFor(error: unknown, fallback: string): string {
  if (isApiError(error)) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function ErrorState({
  error,
  title = 'Something went wrong',
  onRetry,
  className,
}: ErrorStateProps) {
  const description = messageFor(error, 'We could not load this right now.')
  const retryable = !isApiError(error) || error.isRetryable

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center',
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && retryable ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  )
}
