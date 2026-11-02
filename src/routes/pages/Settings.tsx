import { SeoTitle } from '@/components/SeoTitle'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ErrorState'
import { PreferencesForm } from '@/features/settings/components/PreferencesForm'
import { AppearanceCard } from '@/features/settings/components/AppearanceCard'
import { useMe } from '@/hooks/useMe'
import { useAreas } from '@/hooks/useAreas'
import { formatFullDate } from '@/utils/date'

export default function SettingsPage() {
  const me = useMe()
  const areas = useAreas()

  return (
    <div className="space-y-6">
      <SeoTitle title="Settings" description="Your profile, preferences and appearance." />
      <PageHeader
        title="Settings"
        description="What your agents know about you, and how the app looks."
      />

      {me.isPending || areas.isPending ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : me.isError || areas.isError ? (
        <ErrorState
          error={me.error ?? areas.error}
          title="We could not load your settings"
          onRetry={() => {
            void me.refetch()
            void areas.refetch()
          }}
        />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Keyed on the user; after a save the form reseeds itself from the server's reply. */}
            <PreferencesForm key={me.data.id} user={me.data} areas={areas.data} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <span className="bg-brand flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white">
                  {me.data.avatarInitials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{me.data.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {me.data.occupation} · {me.data.preferences.homeAreaName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Member since {formatFullDate(me.data.joinedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <AppearanceCard />
          </aside>
        </div>
      )}
    </div>
  )
}
