import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SeoTitle } from '@/components/SeoTitle'
import { BrandMark } from '@/layouts/BrandMark'

/** Full-page 404, rendered outside the app shell so no sidebar or nav shows around it. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SeoTitle title="Page not found" />

      <header className="flex h-16 items-center px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="BachelorBuddy home">
          <BrandMark className="size-8" />
          <span className="font-semibold tracking-tight">BachelorBuddy</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="flex max-w-md flex-col items-center gap-5 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Compass className="size-7 text-muted-foreground" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <p className="tabular text-sm font-semibold text-primary">404</p>
            <h1 className="text-2xl font-semibold tracking-tight">We can&rsquo;t find that page</h1>
            <p className="text-sm text-muted-foreground">
              The link may be old, or the page may have moved.
            </p>
          </div>
          <Button asChild>
            <Link to="/">
              <ArrowLeft aria-hidden="true" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
