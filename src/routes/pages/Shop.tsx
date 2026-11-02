import { useSearchParams } from 'react-router-dom'
import { Search, ShoppingBag } from 'lucide-react'
import { SeoTitle } from '@/components/SeoTitle'
import { PageHeader } from '@/components/PageHeader'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FilterBar, FilterChips } from '@/components/FilterBar'
import { ProductCard } from '@/components/ProductCard'
import { Pagination } from '@/components/Pagination'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { PriceAlertsStrip } from '@/features/shop/components/PriceAlertsStrip'
import { useProductSearch } from '@/features/shop/hooks/useProducts'
import {
  productCategoryIds,
  productCategoryLabels,
  productSorts,
} from '@/features/shop/utils/productCategories'
import type { ProductCategory, ProductSort } from '@/types/product'
import { cn } from '@/utils/cn'
import { formatINR } from '@/utils/currency'

const PAGE_SIZE = 12

export default function ShopPage() {
  // URL query params are the source of truth; the header search lands here with ?q=.
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const categoryRaw = params.get('category') ?? 'all'
  const category = (
    productCategoryIds.includes(categoryRaw as ProductCategory) ? categoryRaw : 'all'
  ) as ProductCategory | 'all'
  const sort = (params.get('sort') ?? 'price') as ProductSort
  const maxPriceRaw = params.get('maxPrice') ?? ''
  const page = Number(params.get('page') ?? 1)
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined

  const products = useProductSearch({ q, category, sort, maxPrice, page, pageSize: PAGE_SIZE })

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    next.delete('page')
    setParams(next, { replace: true })
  }

  const activeCount = ['q', 'category', 'maxPrice'].filter((key) => params.get(key)).length
  const clearFilters = () => {
    const next = new URLSearchParams()
    if (sort !== 'price') next.set('sort', sort)
    setParams(next, { replace: true })
  }

  const total = products.data?.meta.total ?? 0

  return (
    <div className="space-y-8">
      <SeoTitle title="Shop" description="Compare prices across platforms before you buy." />
      <PageHeader
        title="Shop"
        description="Every price compared across ShopNest, TrendKart and StyleBay, with 90-day history."
      />

      {/* Search and sort inline; category and price cap behind one Filters button. */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <form
            role="search"
            // Uncontrolled and keyed on q, so a header search re-seeds the box.
            key={q}
            onSubmit={(event) => {
              event.preventDefault()
              const value = new FormData(event.currentTarget).get('q')
              setParam('q', typeof value === 'string' ? value.trim() : '')
            }}
            className="relative flex-1"
          >
            <label htmlFor="shop-search" className="sr-only">
              Search products
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="shop-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search formal shoes, backpacks or a brand"
              className="h-9 pl-9"
            />
          </form>
          <div className="flex items-center gap-2">
            <label htmlFor="shop-sort" className="sr-only">
              Sort by
            </label>
            <Select
              id="shop-sort"
              value={sort}
              onValueChange={(value) => setParam('sort', value)}
              className="h-9 w-auto min-w-[10rem]"
            >
              {productSorts.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <FilterBar activeCount={activeCount} onClear={clearFilters}>
              <div className="space-y-1.5">
                <label htmlFor="shop-category">Category</label>
                <Select
                  id="shop-category"
                  value={category}
                  onValueChange={(value) => setParam('category', value)}
                >
                  <option value="all">All categories</option>
                  {productCategoryIds.map((id) => (
                    <option key={id} value={id}>
                      {productCategoryLabels[id]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="shop-max-price">Max price</label>
                <Input
                  id="shop-max-price"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="Any"
                  value={maxPriceRaw}
                  onChange={(e) => setParam('maxPrice', e.target.value)}
                />
              </div>
            </FilterBar>
          </div>
        </div>

        <FilterChips
          chips={[
            ...(q ? [{ key: 'q', label: `“${q}”`, onRemove: () => setParam('q', '') }] : []),
            ...(category !== 'all'
              ? [
                  {
                    key: 'category',
                    label: productCategoryLabels[category],
                    onRemove: () => setParam('category', ''),
                  },
                ]
              : []),
            ...(maxPrice
              ? [
                  {
                    key: 'maxPrice',
                    label: `Under ${formatINR(maxPrice)}`,
                    onRemove: () => setParam('maxPrice', ''),
                  },
                ]
              : []),
          ]}
        />
      </div>

      <PriceAlertsStrip />

      {products.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : products.isError ? (
        <ErrorState
          error={products.error}
          title="We could not load products"
          onRetry={() => void products.refetch()}
        />
      ) : products.data.items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={q ? `Nothing matches “${q}”` : 'Nothing matches those filters'}
          description="Try a broader search, another category, or a higher maximum price."
          actionLabel={activeCount > 0 ? 'Clear filters' : undefined}
          onAction={activeCount > 0 ? clearFilters : undefined}
        />
      ) : (
        <section aria-label="Products" className="space-y-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="tabular font-medium text-foreground">{total}</span>{' '}
            {total === 1 ? 'product' : 'products'}
          </p>
          <ul
            className={cn(
              'grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
              products.isPlaceholderData && 'opacity-60',
            )}
          >
            {products.data.items.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
          <Pagination
            page={products.data.meta.page}
            pageSize={products.data.meta.pageSize}
            total={products.data.meta.total}
            onPageChange={(next) => {
              const nextParams = new URLSearchParams(params)
              nextParams.set('page', String(next))
              setParams(nextParams, { replace: true })
            }}
          />
        </section>
      )}
    </div>
  )
}
