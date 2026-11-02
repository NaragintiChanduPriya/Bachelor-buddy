import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { MobileSidebar, Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { PageSkeleton } from '@/components/PageSkeleton'

export function AppLayout() {
  return (
    <div className="flex min-h-dvh bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <Sidebar />
      <MobileSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 pb-28 pt-6 outline-none sm:px-6 lg:px-8 lg:pb-12 lg:pt-8"
        >
          {/* Same max width and gutters as the top bar, so the two always line up. */}
          <div className="mx-auto w-full max-w-7xl">
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
