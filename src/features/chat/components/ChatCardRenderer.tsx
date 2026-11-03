import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingCart } from 'lucide-react'
import type { ChatCard } from '@/types/chat'
import { ListingCard } from '@/components/ListingCard'
import { BudgetBar } from '@/components/BudgetBar'
import { MoneyText } from '@/components/MoneyText'
import { ProductCard } from '@/components/ProductCard'
import { HomeCard } from '@/components/HomeCard'
import { OfferChip } from '@/components/OfferChip'
import { Card, CardContent } from '@/components/ui/card'
import type { BudgetCategory } from '@/types/budget'

/** Renders the structured cards an agent attaches to a reply. */
export function ChatCardRenderer({ card }: { card: ChatCard }) {
  switch (card.type) {
    case 'food':
      return <ListingCard listing={card.listing} near="office" />

    case 'budgetSummary':
      return (
        <Card>
          <CardContent className="space-y-4 p-4">
            {card.budget.map((category) => (
              // The summary carries every field BudgetBar needs.
              <BudgetBar key={category.id} category={category as BudgetCategory} />
            ))}
          </CardContent>
        </Card>
      )

    case 'product':
      return <ProductCard product={card.product} compact />

    case 'home':
      return <HomeCard home={card.home} />

    case 'offer':
      return (
        <Card>
          <CardContent className="space-y-2 p-4">
            <OfferChip offer={card.offer} />
            <p className="text-sm font-medium">{card.offer.title}</p>
            <p className="text-sm text-muted-foreground">
              On a <MoneyText amount={card.offer.example.orderValue} size="sm" /> order you pay{' '}
              <MoneyText amount={card.offer.example.finalPrice} size="sm" tone="primary" className="font-semibold" />{' '}
              (save <MoneyText amount={card.offer.example.discount} size="sm" tone="success" />).
            </p>
            <Link to="/deals" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              All your offers
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      )

    case 'groceryPlan':
      return (
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ShoppingCart className="size-4 text-muted-foreground" aria-hidden="true" />
              {card.plan.itemCount} items on your monthly list
            </p>
            <MoneyText amount={card.plan.estimatedTotal} size="lg" tone="primary" className="block" />
            <p className="text-sm text-muted-foreground">
              Best single store: {card.plan.cheapestStoreLabel} · a bulk order saves{' '}
              <MoneyText amount={card.plan.bulkSaving} size="sm" tone="success" className="font-semibold" />
            </p>
            <Link
              to="/groceries"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Compare every store
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      )
  }
}
