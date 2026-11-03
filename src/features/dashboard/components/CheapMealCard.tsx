import { Link } from 'react-router-dom'
import { ChevronRight, MapPin, Star, UtensilsCrossed } from 'lucide-react'
import type { FoodListingSummary } from '@/types/food'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MoneyText } from '@/components/MoneyText'
import { formatDistance } from '@/utils/distance'
import { initialsOf, thumbnailStyle } from '@/utils/thumbnail'

export interface CheapMealCardProps {
  /** Live results from /food/nearby, nearest first, under the lunch cap. */
  listings: FoodListingSummary[] | undefined
  loading: boolean
  officeArea: string
}

export function CheapMealCard({ listings, loading, officeArea }: CheapMealCardProps) {
  const top = listings?.slice(0, 3) ?? []

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <UtensilsCrossed className="size-4 text-muted-foreground" aria-hidden="true" />
            Today&rsquo;s cheap lunch
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">Open near your office in {officeArea}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)
        ) : top.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing under the lunch cap nearby right now. Try the Food page for more options.
          </p>
        ) : (
          <ul className="space-y-2">
            {top.map((listing) => (
              <li key={listing.id}>
                <Link
                  to={`/food/${listing.id}`}
                  className="group flex items-center gap-3 rounded-lg border border-border p-2.5 transition-colors hover:border-primary/40 hover:bg-accent/50"
                >
                  <span
                    aria-hidden="true"
                    style={thumbnailStyle(listing.thumbnailSeed)}
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                  >
                    {initialsOf(listing.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{listing.name}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="size-3" aria-hidden="true" />
                        {formatDistance(listing.distanceFromOfficeKm)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Star className="size-3 fill-current text-warning" aria-hidden="true" />
                        <span className="tabular">{listing.rating}</span>
                      </span>
                    </span>
                  </span>
                  <MoneyText
                    amount={listing.avgMealPrice}
                    size="sm"
                    tone="primary"
                    className="font-semibold"
                  />
                  <ChevronRight
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Button asChild variant="ghost" size="sm" className="px-0">
          <Link to="/food?near=office&sort=distance">See all options near office</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
