import { useSearchParams } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { SeoTitle } from '@/components/SeoTitle'
import { PageHeader } from '@/components/PageHeader'
import { Tabs } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/FilterBar'
import { ListingCard } from '@/components/ListingCard'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { useNearbyFood } from '@/features/food/hooks/useFood'
import { useAreas } from '@/hooks/useAreas'
import type { FoodPlaceType, FoodSort, NearAnchor } from '@/types/food'

const tabs: Array<{ value: FoodPlaceType | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'darshini', label: 'Darshini' },
  { value: 'mess', label: 'Mess' },
  { value: 'tiffin', label: 'Tiffin' },
  { value: 'restaurant', label: 'Restaurants' },
]

export default function FoodPage() {
  // URL query params are the source of truth for every filter on this page.
  const [params, setParams] = useSearchParams()
  const areas = useAreas()

  const type = (params.get('type') ?? 'all') as FoodPlaceType | 'all'
  const near = (params.get('near') ?? 'home') as NearAnchor
  const sort = (params.get('sort') ?? 'price') as FoodSort
  const area = params.get('area') ?? ''
  const maxPriceRaw = params.get('maxPrice') ?? ''
  const veg = params.get('veg') === 'true'
  const page = Number(params.get('page') ?? 1)

  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined

  const food = useNearbyFood({
    type,
    near,
    sort,
    area: area || undefined,
    maxPrice,
    veg: veg || undefined,
    page,
  })

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all' || value === 'false') next.delete(key)
    else next.set(key, value)
    next.delete('page')
    setParams(next, { replace: true })
  }

  const activeCount = ['area', 'maxPrice', 'veg'].filter((key) => params.get(key)).length
  const clearFilters = () => {
    const next = new URLSearchParams()
    if (type !== 'all') next.set('type', type)
    if (near !== 'home') next.set('near', near)
    if (sort !== 'price') next.set('sort', sort)
    setParams(next, { replace: true })
  }

  const total = food.data?.meta.total ?? 0

  return (
    <div className="space-y-6">
      <SeoTitle title="Food" description="Cheap good meals near home and office." />
      <PageHeader
        title="Food"
        description={
          food.data
            ? `${total} ${total === 1 ? 'place' : 'places'} near your ${near}`
            : 'Finding places near you…'
        }
      />

      <Tabs
        label="Place type"
        items={tabs}
        value={type}
        onChange={(value) => setParam('type', value)}
      />

      <FilterBar activeCount={activeCount} onClear={clearFilters}>
        <div className="min-w-[150px] flex-1 space-y-1.5">
          <label htmlFor="food-near" className="text-sm font-medium">
            Near
          </label>
          <Select id="food-near" value={near} onChange={(e) => setParam('near', e.target.value)}>
            <option value="home">My home</option>
            <option value="office">My office</option>
          </Select>
        </div>

        <div className="min-w-[150px] flex-1 space-y-1.5">
          <label htmlFor="food-area" className="text-sm font-medium">
            Area
          </label>
          <Select
            id="food-area"
            value={area}
            onChange={(e) => setParam('area', e.target.value)}
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

        <div className="min-w-[130px] flex-1 space-y-1.5">
          <label htmlFor="food-max-price" className="text-sm font-medium">
            Max per meal
          </label>
          <Input
            id="food-max-price"
            type="number"
            inputMode="numeric"
            placeholder="Any"
            value={maxPriceRaw}
            onChange={(e) => setParam('maxPrice', e.target.value)}
          />
        </div>

        <div className="min-w-[150px] flex-1 space-y-1.5">
          <label htmlFor="food-sort" className="text-sm font-medium">
            Sort by
          </label>
          <Select id="food-sort" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
            <option value="price">Cheapest first</option>
            <option value="distance">Nearest first</option>
            <option value="rating">Best rated</option>
          </Select>
        </div>

        <label className="flex h-10 cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="size-4 accent-[var(--primary)]"
            checked={veg}
            onChange={(e) => setParam('veg', String(e.target.checked))}
          />
          Pure veg only
        </label>
      </FilterBar>

      {food.isPending ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : food.isError ? (
        <ErrorState
          error={food.error}
          title="We could not load places near you"
          onRetry={() => void food.refetch()}
        />
      ) : food.data.items.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Nothing matches those filters"
          description="Try raising the maximum price, or switching the area."
          actionLabel={activeCount > 0 ? 'Clear filters' : undefined}
          onAction={activeCount > 0 ? clearFilters : undefined}
        />
      ) : (
        <>
          <ul className="grid gap-3 lg:grid-cols-2">
            {food.data.items.map((listing) => (
              <li key={listing.id}>
                <ListingCard listing={listing} near={near} />
              </li>
            ))}
          </ul>

          {food.data.meta.total > food.data.meta.pageSize ? (
            <nav
              aria-label="Pagination"
              className="flex items-center justify-between gap-3 pt-2"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  const next = new URLSearchParams(params)
                  next.set('page', String(page - 1))
                  setParams(next, { replace: true })
                }}
              >
                Previous
              </Button>
              <p className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(food.data.meta.total / food.data.meta.pageSize)}
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(food.data.meta.total / food.data.meta.pageSize)}
                onClick={() => {
                  const next = new URLSearchParams(params)
                  next.set('page', String(page + 1))
                  setParams(next, { replace: true })
                }}
              >
                Next
              </Button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  )
}
