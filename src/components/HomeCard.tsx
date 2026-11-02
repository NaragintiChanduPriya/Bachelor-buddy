import { Link } from 'react-router-dom'
import { Building2, MapPin, Star, TrendingDown, TrendingUp, UtensilsCrossed } from 'lucide-react'
import type { HomeSummary } from '@/types/home'
import { MoneyText } from '@/components/MoneyText'
import { SponsoredTag } from '@/components/SponsoredTag'
import { formatDistance } from '@/utils/distance'
import { initialsOf, thumbnailStyle } from '@/utils/thumbnail'
import { cn } from '@/utils/cn'

export interface HomeCardProps {
  home: HomeSummary
  className?: string
}

/** The rent-vs-area-average line. The difference is computed by the backend. */
function AverageGap({ home }: { home: HomeSummary }) {
  if (home.differenceFromAverage === 0) {
    return (
      <p className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
        Priced at the area average
      </p>
    )
  }

  const below = home.belowAverage
  const Icon = below ? TrendingDown : TrendingUp
  return (
    <p
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
        below ? 'bg-success/10' : 'bg-warning/15',
      )}
    >
      <Icon className={cn('size-3.5', below ? 'text-success' : 'text-warning')} aria-hidden="true" />
      <MoneyText
        amount={Math.abs(home.differenceFromAverage)}
        size="sm"
        tone={below ? 'success' : 'warning'}
        className="text-xs font-semibold"
      />
      <span>{below ? 'below' : 'above'} the area average</span>
    </p>
  )
}

export function HomeCard({ home, className }: HomeCardProps) {
  const parkKm = home.techParkDistanceKm ?? home.nearestTechParkKm
  const parkName = home.techParkName ?? home.nearestTechParkName

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:shadow-raised focus-within:ring-2 focus-within:ring-ring motion-safe:hover:-translate-y-0.5',
        className,
      )}
    >
      <div className="relative h-24 overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0" style={thumbnailStyle(home.thumbnailSeed)} />
        <span
          aria-hidden="true"
          className="absolute -bottom-4 right-3 text-6xl font-black tracking-tighter text-white/25"
        >
          {initialsOf(home.name)}
        </span>
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="rounded-full bg-black/45 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            {home.typeLabel}
          </span>
          {home.sponsored ? <SponsoredTag className="bg-card/95" /> : null}
        </div>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          <Star className="size-3 fill-current text-amber-300" aria-hidden="true" />
          <span className="tabular">{home.rating}</span>
          <span className="sr-only">out of 5 from</span>
          <span className="text-white/80">({home.reviewCount})</span>
          <span className="sr-only">reviews</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold leading-tight">
            {/* The whole card is clickable, but only the title is a link, so the accessible
                name stays meaningful. */}
            <Link
              to={`/homes/${home.id}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {home.name}
            </Link>
          </h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" aria-hidden="true" />
            {home.areaName} · {home.sharingLabel}
          </p>
        </div>

        <p>
          <MoneyText amount={home.rent} size="lg" tone="primary" />
          <span className="text-sm text-muted-foreground"> / month</span>
        </p>

        <AverageGap home={home} />

        <ul className="mt-auto grid gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {formatDistance(parkKm)} to {parkName}
            </span>
          </li>
          <li className="flex items-center gap-1.5">
            <UtensilsCrossed className="size-3.5 shrink-0" aria-hidden="true" />
            {home.foodIncluded ? 'Meals included' : 'No meals'}
          </li>
        </ul>
      </div>
    </article>
  )
}
