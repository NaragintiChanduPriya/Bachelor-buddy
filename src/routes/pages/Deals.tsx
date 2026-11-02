import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Clock, Tag } from 'lucide-react'
import { SeoTitle } from '@/components/SeoTitle'
import { PageHeader } from '@/components/PageHeader'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FilterBar, FilterChips } from '@/components/FilterBar'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { OfferCard } from '@/features/deals/components/OfferCard'
import { useOffers } from '@/features/deals/hooks/useOffers'
import { offerPlatforms, platformCategoryLabels } from '@/features/deals/utils/offerPlatforms'
import { useMe } from '@/hooks/useMe'
import type { Offer, OfferPlatformCategory } from '@/types/offer'
import { cn } from '@/utils/cn'

const categoryOrder: OfferPlatformCategory[] = ['shopping', 'food', 'groceries']

export default function DealsPage() {
  const [params, setParams] = useSearchParams()
  const platform = params.get('platform') ?? ''
  const card = params.get('card') ?? ''
  const showAll = params.get('view') === 'all'
  const reduceMotion = useReducedMotion()

  const me = useMe()
  const offers = useOffers({
    platform: platform || undefined,
    card: card || undefined,
    eligibleOnly: !showAll,
  })

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const activeCount = ['platform', 'card', 'view'].filter((key) => params.get(key)).length
  const clearFilters = () => setParams(new URLSearchParams(), { replace: true })

  const list = offers.data?.offers ?? []
  const expiring = list.filter((offer) => offer.eligible && offer.expiringSoon)
  const rest = list.filter((offer) => !(offer.eligible && offer.expiringSoon))
  const groups = categoryOrder
    .map((category) => ({ category, items: rest.filter((o) => o.platformCategory === category) }))
    .filter((group) => group.items.length > 0)

  const description = offers.data
    ? `${offers.data.eligibleCount} offers work with your cards · ${offers.data.expiringSoonCount} end within 3 days. Every price shown is what you really pay after the cap.`
    : 'Matching offers to your cards…'

  const renderGrid = (items: Offer[]) => (
    <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((offer, index) => (
        <motion.li
          key={offer.id}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : index * 0.03 }}
        >
          <OfferCard offer={offer} />
        </motion.li>
      ))}
    </ul>
  )

  return (
    <div className="space-y-8">
      <SeoTitle
        title="Deals"
        description="Card offers, coupons and cashback you can actually use."
      />
      <PageHeader title="Deals" description={description} />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {offers.data ? (
              <>
                <span className="tabular font-medium text-foreground">{list.length}</span>{' '}
                {list.length === 1 ? 'offer' : 'offers'}
              </>
            ) : (
              'Loading offers…'
            )}
          </p>
          <FilterBar activeCount={activeCount} onClear={clearFilters}>
            <div className="min-w-[160px] flex-1 space-y-1.5 sm:max-w-[220px]">
              <label htmlFor="deals-platform">Platform</label>
              <Select
                id="deals-platform"
                value={platform}
                onValueChange={(value) => setParam('platform', value)}
              >
                <option value="">All platforms</option>
                {offerPlatforms.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-[180px] flex-1 space-y-1.5 sm:max-w-[240px]">
              <label htmlFor="deals-card">Card</label>
              <Select
                id="deals-card"
                value={card}
                onValueChange={(value) => setParam('card', value)}
              >
                <option value="">Any of my cards</option>
                {me.data?.preferences.cards.map((saved) => (
                  <option key={saved.id} value={saved.id}>
                    {saved.label}
                  </option>
                ))}
              </Select>
            </div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="size-4 accent-[var(--primary)]"
                checked={showAll}
                onChange={(event) => setParam('view', event.target.checked ? 'all' : '')}
              />
              <span className="text-sm text-foreground">Include offers for other cards</span>
            </label>
          </FilterBar>
        </div>
        <FilterChips
          chips={[
            ...(platform
              ? [{ key: 'platform', label: platform, onRemove: () => setParam('platform', '') }]
              : []),
            ...(card
              ? [
                  {
                    key: 'card',
                    label: me.data?.preferences.cards.find((c) => c.id === card)?.label ?? card,
                    onRemove: () => setParam('card', ''),
                  },
                ]
              : []),
            ...(showAll
              ? [
                  {
                    key: 'view',
                    label: 'Including other cards',
                    onRemove: () => setParam('view', ''),
                  },
                ]
              : []),
          ]}
        />
      </div>

      {offers.isPending ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : offers.isError ? (
        <ErrorState
          error={offers.error}
          title="We could not load offers"
          onRetry={() => void offers.refetch()}
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No offers match"
          description="Try another platform or card, or include offers for cards you don't hold."
          actionLabel={activeCount > 0 ? 'Clear filters' : undefined}
          onAction={activeCount > 0 ? clearFilters : undefined}
        />
      ) : (
        <div
          className={cn('space-y-10 transition-opacity', offers.isPlaceholderData && 'opacity-60')}
        >
          {expiring.length > 0 ? (
            <section aria-labelledby="expiring-heading" className="space-y-4">
              <h2 id="expiring-heading" className="flex items-center gap-2 text-base font-semibold">
                <Clock className="size-4 text-warning" aria-hidden="true" />
                Ending soon
              </h2>
              {renderGrid(expiring)}
            </section>
          ) : null}

          {groups.map((group) => (
            <section
              key={group.category}
              aria-labelledby={`deals-${group.category}`}
              className="space-y-4"
            >
              <h2 id={`deals-${group.category}`} className="text-base font-semibold">
                {platformCategoryLabels[group.category]}
              </h2>
              {renderGrid(group.items)}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
