import { Link, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  ClipboardList,
  Info,
  MapPin,
  MessageCircleHeart,
  Scale,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react'
import type { HomeDetail } from '@/types/home'
import { SeoTitle } from '@/components/SeoTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MoneyText } from '@/components/MoneyText'
import { ErrorState } from '@/components/ErrorState'
import { SponsoredTag } from '@/components/SponsoredTag'
import { InsightCallout } from '@/components/InsightCallout'
import { AmenityGrid } from '@/features/homes/components/AmenityGrid'
import { CommuteTable } from '@/features/homes/components/CommuteTable'
import { useHome } from '@/features/homes/hooks/useHomes'
import { useMe } from '@/hooks/useMe'
import { formatINR } from '@/utils/currency'
import { formatDate, formatFullDate } from '@/utils/date'
import { formatDistance } from '@/utils/distance'
import { initialsOf, thumbnailStyle } from '@/utils/thumbnail'

const typeNouns: Record<HomeDetail['type'], string> = {
  pg: 'PGs',
  coliving: 'co-living spaces',
  sharedFlat: 'shared flats',
}

/** Rent vs the area's market average, and vs the user's own rent budget. All server numbers. */
function RentComparison({ home }: { home: HomeDetail }) {
  const gap = Math.abs(home.differenceFromAverage)
  const yearly = Math.abs(home.yearlyDifferenceFromAverage)
  const budgetGap = Math.abs(home.differenceFromRentBudget)

  const budgetLine =
    home.differenceFromRentBudget < 0 ? (
      <>
        It is <MoneyText amount={budgetGap} size="sm" tone="success" className="font-semibold" />{' '}
        under your <MoneyText amount={home.rentBudget} size="sm" /> rent budget.
      </>
    ) : home.differenceFromRentBudget > 0 ? (
      <>
        It is <MoneyText amount={budgetGap} size="sm" tone="warning" className="font-semibold" />{' '}
        over your <MoneyText amount={home.rentBudget} size="sm" /> rent budget.
      </>
    ) : (
      <>
        It matches your <MoneyText amount={home.rentBudget} size="sm" /> rent budget exactly.
      </>
    )

  const average = (
    <>
      Comparable {typeNouns[home.type]} in {home.areaName} average{' '}
      <MoneyText amount={home.areaAverageRent} size="sm" className="font-medium" />.
    </>
  )

  if (home.belowAverage) {
    return (
      <InsightCallout
        tone="success"
        icon={TrendingDown}
        title={`${formatINR(gap)} below the ${home.areaName} average`}
      >
        <p>
          {average} Over a year that is{' '}
          <MoneyText amount={yearly} size="sm" tone="success" className="font-semibold" /> back in
          your pocket. {budgetLine}
        </p>
      </InsightCallout>
    )
  }

  if (home.differenceFromAverage > 0) {
    return (
      <InsightCallout
        tone="warning"
        icon={TrendingUp}
        title={`${formatINR(gap)} above the ${home.areaName} average`}
      >
        <p>
          {average} Over a year you would pay{' '}
          <MoneyText amount={yearly} size="sm" tone="warning" className="font-semibold" /> more
          than the going rate — worth negotiating, or comparing similar places nearby.{' '}
          {budgetLine}
        </p>
      </InsightCallout>
    )
  }

  return (
    <InsightCallout
      icon={Scale}
      title={`Priced at the ${home.areaName} average`}
    >
      <p>
        {average} {budgetLine}
      </p>
    </InsightCallout>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading home">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  )
}

export default function HomeDetailPage() {
  const { id = '' } = useParams()
  const home = useHome(id)
  const me = useMe()
  const reduceMotion = useReducedMotion()

  if (home.isPending) return <DetailSkeleton />

  if (home.isError) {
    return (
      <div className="space-y-4">
        <SeoTitle title="Home not found" />
        <ErrorState
          error={home.error}
          title="We could not load this place"
          onRetry={() => void home.refetch()}
        />
        <Button asChild variant="outline">
          <Link to="/homes">Back to homes</Link>
        </Button>
      </div>
    )
  }

  const place = home.data
  const userParkId = me.data?.preferences.techParkId ?? null
  const officeKm = place.techParkDistanceKm ?? place.nearestTechParkKm

  const facts: Array<{ label: string; value: React.ReactNode }> = [
    { label: 'Type', value: place.typeLabel },
    { label: 'Sharing', value: place.sharingLabel },
    { label: 'Notice period', value: `${place.noticePeriodDays} days` },
    {
      label: 'Maintenance',
      value: place.maintenanceIncluded ? 'Included in rent' : 'Charged separately',
    },
    {
      label: 'Available',
      value: place.availableNow ? 'Now' : `From ${formatFullDate(place.availableFrom)}`,
    },
    {
      label: 'Bachelors',
      value: place.bachelorFriendly ? 'Welcome' : 'Families preferred',
    },
  ]

  return (
    <motion.div
      className="space-y-6"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
    >
      <SeoTitle title={place.name} description={place.description} />

      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/homes">
          <ArrowLeft aria-hidden="true" />
          All homes
        </Link>
      </Button>

      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="relative h-32 sm:h-44" aria-hidden="true">
          <div className="absolute inset-0" style={thumbnailStyle(place.thumbnailSeed)} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
          <span className="absolute -bottom-6 right-4 text-8xl font-black tracking-tighter text-white/20 sm:text-9xl">
            {initialsOf(place.name)}
          </span>
        </div>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{place.typeLabel}</Badge>
                <Badge variant="muted">{place.sharingLabel}</Badge>
                {place.sponsored ? <SponsoredTag /> : null}
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{place.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-4 shrink-0" aria-hidden="true" />
                  {place.address}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-current text-warning" aria-hidden="true" />
                  <span className="tabular font-medium text-foreground">{place.rating}</span>
                  <span>({place.reviewCount} reviews)</span>
                </span>
              </div>
            </div>

            <div className="space-y-1 sm:text-right">
              <p>
                <MoneyText amount={place.rent} size="xl" tone="primary" />
                <span className="text-sm text-muted-foreground"> / month</span>
              </p>
              {place.availableNow ? (
                <Badge variant="success">
                  <CalendarCheck className="size-3" aria-hidden="true" />
                  Available now
                </Badge>
              ) : (
                <Badge variant="muted">
                  <CalendarCheck className="size-3" aria-hidden="true" />
                  Available from {formatDate(place.availableFrom)}
                </Badge>
              )}
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-4 border-t border-border pt-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Deposit</dt>
              <dd>
                <MoneyText amount={place.deposit} size="md" className="font-semibold" />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Move-in cost</dt>
              <dd>
                <MoneyText amount={place.moveInCost} size="md" className="font-semibold" />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">To your office</dt>
              <dd className="tabular font-semibold">{formatDistance(officeKm)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <RentComparison home={place} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="size-4 text-muted-foreground" aria-hidden="true" />
                About this place
              </CardTitle>
              <CardDescription>{place.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-muted-foreground" aria-hidden="true" />
                Amenities
              </h3>
              <AmenityGrid amenities={place.amenities} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />
                Commute to tech parks
              </CardTitle>
              <CardDescription>
                Road distance with typical weekday travel times. Your office is highlighted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommuteTable
                homeName={place.name}
                commutes={place.commutes}
                userTechParkId={userParkId}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="size-4 text-muted-foreground" aria-hidden="true" />
                Key facts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border text-sm">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-muted-foreground">{fact.label}</dt>
                    <dd className="text-right font-medium">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UtensilsCrossed className="size-4 text-muted-foreground" aria-hidden="true" />
                  Food
                </CardTitle>
                {place.foodIncluded && place.mealsPerDay ? (
                  <Badge variant="success">
                    {place.mealsPerDay} {place.mealsPerDay === 1 ? 'meal' : 'meals'} a day
                  </Badge>
                ) : (
                  <Badge variant="muted">Not included</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {place.foodIncluded ? (
                <p className="text-muted-foreground">
                  {place.foodDetails ?? 'Meals are included in the rent.'}
                </p>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    No meals are included. A monthly tiffin plan nearby is usually the cheapest way
                    to cover weekday lunches.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/food?type=tiffin&area=${place.areaId}`}>
                      Tiffin plans in {place.areaName}
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
            <CardContent className="space-y-3 p-5">
              <p className="font-semibold">Not sure yet?</p>
              <p className="text-sm text-muted-foreground">
                Ask Buddy how this compares with what you pay now, or for cheaper places nearby.
              </p>
              <Button asChild size="sm">
                <Link to="/chat">
                  <MessageCircleHeart aria-hidden="true" />
                  Ask Buddy
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
