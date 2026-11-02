import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, Star } from 'lucide-react'
import { SeoTitle } from '@/components/SeoTitle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MoneyText } from '@/components/MoneyText'
import { ErrorState } from '@/components/ErrorState'
import { SponsoredTag } from '@/components/SponsoredTag'
import { DeliveryCompareCard } from '@/features/food/components/DeliveryCompareCard'
import { useDeliveryComparison, useFoodListing } from '@/features/food/hooks/useFood'
import { formatDistance } from '@/utils/distance'

const typeLabels = {
  darshini: 'Darshini',
  mess: 'Mess',
  tiffin: 'Tiffin service',
  restaurant: 'Restaurant',
} as const

export default function FoodDetailPage() {
  const { id = '' } = useParams()
  const listing = useFoodListing(id)
  const comparison = useDeliveryComparison(
    id,
    undefined,
    Boolean(listing.data?.deliveryAvailable),
  )

  if (listing.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  if (listing.isError) {
    return (
      <div className="space-y-4">
        <SeoTitle title="Place not found" />
        <ErrorState
          error={listing.error}
          title="We could not load this place"
          onRetry={() => void listing.refetch()}
        />
        <Button asChild variant="outline">
          <Link to="/food">Back to food</Link>
        </Button>
      </div>
    )
  }

  const place = listing.data
  const popular = place.menu.filter((item) => item.popular)
  const rest = place.menu.filter((item) => !item.popular)

  return (
    <div className="space-y-6">
      <SeoTitle title={place.name} description={place.description} />

      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/food">
          <ArrowLeft aria-hidden="true" />
          All food
        </Link>
      </Button>

      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{place.name}</h1>
            <p className="text-sm text-muted-foreground">{place.description}</p>
          </div>
          {place.sponsored ? <SponsoredTag /> : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <Badge variant="muted">{typeLabels[place.type]}</Badge>
          {place.veg ? <Badge variant="success">Pure veg</Badge> : null}
          <span className="flex items-center gap-1">
            <Star className="size-4 fill-current text-warning" aria-hidden="true" />
            <span className="tabular">{place.rating}</span>
            <span>({place.reviewCount} reviews)</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-4" aria-hidden="true" />
            {place.timings}
            {place.openNow ? (
              <span className="text-success"> · Open now</span>
            ) : (
              <span> · Closed</span>
            )}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-4" aria-hidden="true" />
            {place.address}
          </span>
        </div>

        <ul className="flex flex-wrap gap-2">
          {place.tags.map((tag) => (
            <li key={tag}>
              <Badge variant="outline">{tag}</Badge>
            </li>
          ))}
        </ul>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">
              {place.monthlyPlanPrice ? 'Monthly plan from' : 'Typical meal'}
            </p>
            <MoneyText
              amount={place.monthlyPlanPrice ?? place.avgMealPrice}
              size="xl"
              tone="primary"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">From your home</p>
            <p className="text-3xl font-bold tracking-tight tabular">
              {formatDistance(place.distanceFromHomeKm)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">From your office</p>
            <p className="text-3xl font-bold tracking-tight tabular">
              {formatDistance(place.distanceFromOfficeKm)}
            </p>
          </CardContent>
        </Card>
      </div>

      {place.deliveryAvailable ? (
        comparison.isPending ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : comparison.isError ? (
          <ErrorState
            error={comparison.error}
            title="We could not compare delivery"
            onRetry={() => void comparison.refetch()}
          />
        ) : (
          <DeliveryCompareCard comparison={comparison.data} />
        )
      ) : (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            {place.name} does not deliver — which is part of why it stays cheap.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Menu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {popular.length > 0 ? (
            <section aria-labelledby="popular-items" className="space-y-2">
              <h3 id="popular-items" className="text-sm font-semibold text-muted-foreground">
                Popular
              </h3>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {popular.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="flex items-center gap-2 text-sm">
                      {item.name}
                      {item.veg ? null : <Badge variant="outline">Non-veg</Badge>}
                    </span>
                    <MoneyText amount={item.price} size="sm" />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {rest.length > 0 ? (
            <section aria-labelledby="other-items" className="space-y-2">
              <h3 id="other-items" className="text-sm font-semibold text-muted-foreground">
                Everything else
              </h3>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {rest.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="flex items-center gap-2 text-sm">
                      {item.name}
                      {item.veg ? null : <Badge variant="outline">Non-veg</Badge>}
                    </span>
                    <MoneyText amount={item.price} size="sm" />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
