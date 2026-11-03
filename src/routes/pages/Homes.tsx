import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { House } from 'lucide-react'
import { SeoTitle } from '@/components/SeoTitle'
import { PageHeader } from '@/components/PageHeader'
import { Tabs } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FilterBar, FilterChips } from '@/components/FilterBar'
import { HomeCard } from '@/components/HomeCard'
import { Pagination } from '@/components/Pagination'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { HomeSearchInsightCallout } from '@/features/homes/components/HomeSearchInsightCallout'
import { useHomeSearch } from '@/features/homes/hooks/useHomes'
import { useAreas } from '@/hooks/useAreas'
import { useMe } from '@/hooks/useMe'
import type { HomeType } from '@/types/home'
import { formatINR } from '@/utils/currency'
import { cn } from '@/utils/cn'

const tabs: Array<{ value: HomeType | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pg', label: 'PG' },
  { value: 'coliving', label: 'Co-living' },
  { value: 'sharedFlat', label: 'Shared flat' },
]

const rentPresets = [7000, 8000, 10000, 12000, 15000, 20000]
const distancePresets = [2, 5, 8, 12]

/** Reads a positive number from the URL, ignoring anything the server would reject. */
function positiveParam(raw: string | null): number | undefined {
  if (!raw) return undefined
  const value = Number(raw)
  return Number.isFinite(value) && value > 0 ? value : undefined
}

export default function HomesPage() {
  // URL query params are the source of truth for every filter on this page.
  const [params, setParams] = useSearchParams()
  const areas = useAreas()
  const me = useMe()
  const reduceMotion = useReducedMotion()

  const typeRaw = params.get('type') ?? 'all'
  const type = tabs.some((t) => t.value === typeRaw) ? (typeRaw as HomeType | 'all') : 'all'
  const area = params.get('area') ?? ''
  const techPark = params.get('techPark') ?? ''
  const foodIncluded = params.get('foodIncluded') === 'true'
  const maxRent = positiveParam(params.get('maxRent'))
  const maxDistanceKm = positiveParam(params.get('maxDistanceKm'))
  const page = positiveParam(params.get('page')) ?? 1

  const homes = useHomeSearch({
    type,
    area: area || undefined,
    techPark: techPark || undefined,
    foodIncluded: foodIncluded || undefined,
    maxRent,
    maxDistanceKm,
    page,
  })

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all' || value === 'false') next.delete(key)
    else next.set(key, value)
    next.delete('page')
    setParams(next, { replace: true })
  }

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(params)
    if (nextPage <= 1) next.delete('page')
    else next.set('page', String(nextPage))
    setParams(next, { replace: true })
  }

  const filterKeys = ['area', 'maxRent', 'foodIncluded', 'techPark', 'maxDistanceKm']
  const activeCount = filterKeys.filter((key) => params.get(key)).length
  const clearFilters = () => {
    const next = new URLSearchParams()
    if (type !== 'all') next.set('type', type)
    setParams(next, { replace: true })
  }

  const userParkName = me.data?.preferences.techParkName
  // Keep a custom rent from a deep link selectable, even when it is not one of the presets.
  const rentOptions =
    maxRent && !rentPresets.includes(maxRent)
      ? [...rentPresets, maxRent].sort((a, b) => a - b)
      : rentPresets
  const total = homes.data?.meta.total ?? 0
  const refreshing = homes.isPlaceholderData && homes.isFetching

  return (
    <div className="space-y-8">
      <SeoTitle
        title="Homes"
        description="Bachelor-friendly PGs, co-living and shared flats compared with the area average."
      />
      <PageHeader
        title="Homes"
        description={
          homes.data
            ? `${total} bachelor-friendly ${total === 1 ? 'place' : 'places'}, each compared with its area average`
            : 'Finding places that fit your rent budget…'
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          label="Home type"
          items={tabs}
          value={type}
          onChange={(value) => setParam('type', value)}
        />

        <FilterBar activeCount={activeCount} onClear={clearFilters}>
          <div className="min-w-[150px] flex-1 space-y-1.5">
            <label htmlFor="homes-area" className="text-sm font-medium">
              Area
            </label>
            <Select
              id="homes-area"
              value={area}
              onValueChange={(value) => setParam('area', value)}
              disabled={areas.isPending}
            >
              <option value="">Any area</option>
              {areas.data?.areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="min-w-[140px] flex-1 space-y-1.5">
            <label htmlFor="homes-max-rent" className="text-sm font-medium">
              Max rent
            </label>
            <Select
              id="homes-max-rent"
              value={maxRent ? String(maxRent) : ''}
              onValueChange={(value) => setParam('maxRent', value)}
            >
              <option value="">Any rent</option>
              {rentOptions.map((value) => (
                <option key={value} value={value}>
                  Up to {formatINR(value)}
                </option>
              ))}
            </Select>
          </div>

          <div className="min-w-[180px] flex-1 space-y-1.5">
            <label htmlFor="homes-tech-park" className="text-sm font-medium">
              Distance measured to
            </label>
            <Select
              id="homes-tech-park"
              value={techPark}
              onValueChange={(value) => setParam('techPark', value)}
              disabled={areas.isPending}
            >
              <option value="">
                {userParkName ? `Your office (${userParkName})` : 'Nearest tech park'}
              </option>
              {areas.data?.techParks.map((park) => (
                <option key={park.id} value={park.id}>
                  {park.name} · {park.areaName}
                </option>
              ))}
            </Select>
          </div>

          <div className="min-w-[130px] flex-1 space-y-1.5">
            <label htmlFor="homes-distance" className="text-sm font-medium">
              Max distance
            </label>
            <Select
              id="homes-distance"
              value={maxDistanceKm ? String(maxDistanceKm) : ''}
              onValueChange={(value) => setParam('maxDistanceKm', value)}
            >
              <option value="">Any distance</option>
              {distancePresets.map((km) => (
                <option key={km} value={km}>
                  Within {km} km
                </option>
              ))}
              {maxDistanceKm && !distancePresets.includes(maxDistanceKm) ? (
                <option value={maxDistanceKm}>Within {maxDistanceKm} km</option>
              ) : null}
            </Select>
          </div>

          <label className="flex h-10 cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              className="size-4 accent-[var(--primary)]"
              checked={foodIncluded}
              onChange={(e) => setParam('foodIncluded', String(e.target.checked))}
            />
            <span className="text-sm text-foreground">Meals included</span>
          </label>
        </FilterBar>
      </div>

      <FilterChips
        chips={[
          ...(area
            ? [
                {
                  key: 'area',
                  label: areas.data?.areas.find((a) => a.id === area)?.name ?? area,
                  onRemove: () => setParam('area', ''),
                },
              ]
            : []),
          ...(maxRent
            ? [
                {
                  key: 'maxRent',
                  label: `Up to ${formatINR(maxRent)}`,
                  onRemove: () => setParam('maxRent', ''),
                },
              ]
            : []),
          ...(techPark
            ? [
                {
                  key: 'techPark',
                  label: areas.data?.techParks.find((p) => p.id === techPark)?.name ?? techPark,
                  onRemove: () => setParam('techPark', ''),
                },
              ]
            : []),
          ...(maxDistanceKm
            ? [
                {
                  key: 'maxDistanceKm',
                  label: `Within ${maxDistanceKm} km`,
                  onRemove: () => setParam('maxDistanceKm', ''),
                },
              ]
            : []),
          ...(foodIncluded
            ? [
                {
                  key: 'foodIncluded',
                  label: 'Meals included',
                  onRemove: () => setParam('foodIncluded', ''),
                },
              ]
            : []),
        ]}
      />

      {homes.isPending ? (
        <div className="space-y-4" role="status" aria-label="Loading homes">
          <Skeleton className="h-20 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </div>
      ) : homes.isError ? (
        <ErrorState
          error={homes.error}
          title="We could not load homes"
          onRetry={() => void homes.refetch()}
        />
      ) : homes.data.items.length === 0 ? (
        <EmptyState
          icon={House}
          title="No homes match those filters"
          description="Try a higher rent, a wider distance, or another area."
          actionLabel={activeCount > 0 ? 'Clear filters' : undefined}
          onAction={activeCount > 0 ? clearFilters : undefined}
        />
      ) : (
        <div className="space-y-4">
          <HomeSearchInsightCallout insight={homes.data.insight} />

          <ul
            aria-busy={refreshing}
            className={cn(
              'grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3',
              refreshing && 'opacity-60',
            )}
          >
            {homes.data.items.map((home, index) => (
              <motion.li
                key={home.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.25,
                  delay: reduceMotion ? 0 : Math.min(index, 8) * 0.03,
                  ease: 'easeOut',
                }}
              >
                <HomeCard home={home} />
              </motion.li>
            ))}
          </ul>

          <Pagination
            page={homes.data.meta.page}
            pageSize={homes.data.meta.pageSize}
            total={homes.data.meta.total}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
