import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SeoTitle } from '@/components/SeoTitle'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <SeoTitle title="Page not found" />
      <span className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Compass className="size-7 text-muted-foreground" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">We can't find that page</h1>
        <p className="text-sm text-muted-foreground">
          The link may be old, or the page may have moved.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  )
}
