import { Hammer } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { SeoTitle } from '@/components/SeoTitle'
import { EmptyState } from '@/components/EmptyState'

/** Placeholder for routes that land in Phases 2-5, so navigation is complete from Phase 1. */
export function ComingSoon({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="space-y-6">
      <SeoTitle title={title} />
      <PageHeader title={title} />
      <EmptyState
        icon={Hammer}
        title={`${title} arrives in ${phase}`}
        description="The route, layout and navigation are wired up. The page itself is built in a later phase."
      />
    </div>
  )
}
