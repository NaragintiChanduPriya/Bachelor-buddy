import { Link } from 'react-router-dom'
import { Clock, MapPin, Star } from 'lucide-react'
import type { FoodListingSummary, NearAnchor } from '@/types/food'
import { Badge } from '@/components/ui/badge'
import { MoneyText } from '@/components/MoneyText'
import { SponsoredTag } from '@/components/SponsoredTag'
import { formatDistance } from '@/utils/distance'
import { cn } from '@/utils/cn'

const typeLabels: Record<FoodListingSummary['type'], string> = {
  darshini: 'Darshini',
  mess: 'Mess',
  tiffin: 'Tiffin',
  restaurant: 'Restaurant',
}

/** Gradient thumbnail derived from the seed — no real brand imagery anywhere. */
function thumbnailStyle(seed: number) {
  const hue = seed % 360
  return {
    background: `linear-gradient(135deg, oklch(0.72 0.12 ${hue}), oklch(0.58 0.14 ${(hue + 48) % 360}))`,
  }
}

export interface ListingCardProps {
  listing: FoodListingSummary
  near: NearAnchor
  className?: string
}

export function ListingCard({ listing, near, className }: ListingCardProps) {
  const distance =
    near === 'office' ? listing.distanceFromOfficeKm : listing.distanceFromHomeKm
  const initials = listing.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          aria-hidden="true"
          style={thumbnailStyle(listing.thumbnailSeed)}
          className="flex size-14 shrink-0 items-center justify-center rounded-lg text-base font-bold text-white/95"
        >
          {initials}
        </span>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight">
              {/* The whole card is clickable, but only the title is a link, so the
                  accessible name stays meaningful. */}
              <Link
                to={`/food/${listing.id}`}
                className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
              >
                {listing.name}
              </Link>
            </h3>
            {listing.sponsored ? <SponsoredTag /> : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <Badge variant="muted">{typeLabels[listing.type]}</Badge>
            {listing.veg ? (
              <Badge variant="success" className="gap-1">
                Pure veg
              </Badge>
            ) : null}
            <span className="flex items-center gap-1">
              <Star className="size-3 fill-current text-warning" aria-hidden="true" />
              <span className="tabular">{listing.rating}</span>
              <span>({listing.reviewCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3" aria-hidden="true" />
              {formatDistance(distance)} from {near}
            </span>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-2 pt-0.5">
            <p className="text-sm">
              {listing.monthlyPlanPrice ? (
                <>
                  <MoneyText amount={listing.monthlyPlanPrice} size="md" tone="primary" />
                  <span className="text-muted-foreground"> / month</span>
                </>
              ) : (
                <>
                  <MoneyText amount={listing.avgMealPrice} size="md" tone="primary" />
                  <span className="text-muted-foreground"> a meal</span>
                </>
              )}
            </p>
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                listing.openNow ? 'text-success' : 'text-muted-foreground',
              )}
            >
              <Clock className="size-3" aria-hidden="true" />
              {listing.openNow ? 'Open now' : 'Closed'}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
