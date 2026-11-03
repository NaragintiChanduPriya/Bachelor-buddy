import { Link } from 'react-router-dom'
import { Star, Truck } from 'lucide-react'
import type { ProductSummary } from '@/types/product'
import { MoneyText } from '@/components/MoneyText'
import { SponsoredTag } from '@/components/SponsoredTag'
import { productCategoryIcons } from '@/features/shop/utils/categoryIcons'
import { thumbnailStyle } from '@/utils/thumbnail'
import { cn } from '@/utils/cn'

export interface ProductCardProps {
  product: ProductSummary
  /** Compact drops the tall thumbnail, for chat replies and side panels. */
  compact?: boolean
  className?: string
}

function deliveryLabel(days: number): string {
  if (days <= 0) return 'Delivery today'
  if (days === 1) return 'Delivery tomorrow'
  return `Delivery in ${days} days`
}

/**
 * One product with its lowest price across platforms. The lowest price, MRP and discount all
 * come from the backend; the card only lays them out.
 */
export function ProductCard({ product, compact = false, className }: ProductCardProps) {
  const Icon = productCategoryIcons[product.category]

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-raised',
        compact && 'flex-row items-start gap-3 p-3',
        className,
      )}
    >
      <div
        aria-hidden="true"
        style={thumbnailStyle(product.thumbnailSeed)}
        className={cn(
          'relative flex shrink-0 items-center justify-center text-white/95',
          compact ? 'size-16 rounded-lg' : 'h-32 w-full',
        )}
      >
        <Icon className={compact ? 'size-7' : 'size-11 drop-shadow-sm'} strokeWidth={1.5} />
        {!compact && product.discountPercent > 0 ? (
          <span className="tabular absolute left-3 top-3 rounded-full bg-black/25 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm">
            {product.discountPercent}% off
          </span>
        ) : null}
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col gap-1.5', !compact && 'p-4')}>
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </p>
          {product.sponsored ? <SponsoredTag className="shrink-0" /> : null}
        </div>

        <h3 className="line-clamp-2 font-semibold leading-snug">
          {/* The whole card is clickable, but only the title is a link. */}
          <Link
            to={`/shop/${product.id}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3 fill-current text-warning" aria-hidden="true" />
          <span className="tabular font-medium text-foreground">{product.rating}</span>
          <span className="tabular">({product.reviewCount.toLocaleString('en-IN')})</span>
        </div>

        <div className="mt-auto space-y-1 pt-1.5">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <MoneyText amount={product.lowestPrice} size="lg" tone="primary" />
            {product.mrp > product.lowestPrice ? (
              <span className="text-sm text-muted-foreground line-through">
                <span className="sr-only">MRP </span>
                <MoneyText amount={product.mrp} size="sm" tone="muted" />
              </span>
            ) : null}
          </p>
          <p className="text-xs text-muted-foreground">
            Lowest on <span className="font-medium text-foreground">{product.cheapestPlatform}</span>
          </p>
          <p className="flex items-center gap-1 text-xs text-success">
            <Truck className="size-3.5" aria-hidden="true" />
            {deliveryLabel(product.fastestDeliveryDays)}
          </p>
        </div>
      </div>
    </article>
  )
}
