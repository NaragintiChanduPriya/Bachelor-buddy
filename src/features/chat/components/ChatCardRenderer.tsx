import { Link } from 'react-router-dom'
import type { ChatCard } from '@/types/chat'
import { ListingCard } from '@/components/ListingCard'
import { BudgetBar } from '@/components/BudgetBar'
import { MoneyText } from '@/components/MoneyText'
import { Badge } from '@/components/ui/badge'
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
      return (
        <Card>
          <CardContent className="space-y-1 p-4">
            <div className="flex items-start justify-between gap-2">
              <Link to={`/shop/${card.product.id}`} className="font-medium hover:underline">
                {card.product.name}
              </Link>
              {card.product.sponsored ? <Badge variant="muted">Sponsored</Badge> : null}
            </div>
            <p className="text-sm text-muted-foreground">{card.product.brand}</p>
            <MoneyText amount={card.product.lowestPrice} size="lg" tone="primary" />
            <p className="text-xs text-muted-foreground">
              Cheapest on {card.product.cheapestPlatform}
            </p>
          </CardContent>
        </Card>
      )

    case 'home':
      return (
        <Card>
          <CardContent className="space-y-1 p-4">
            <Link to={`/homes/${card.home.id}`} className="font-medium hover:underline">
              {card.home.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              {card.home.typeLabel} in {card.home.areaName}
            </p>
            <MoneyText amount={card.home.rent} size="lg" tone="primary" />
            <span className="text-sm text-muted-foreground"> a month</span>
          </CardContent>
        </Card>
      )

    case 'offer':
      return (
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="font-medium">{card.offer.title}</p>
            <p className="text-sm text-muted-foreground">{card.offer.description}</p>
            <Badge variant={card.offer.expiringSoon ? 'warning' : 'muted'}>
              {card.offer.daysLeft} days left
            </Badge>
          </CardContent>
        </Card>
      )

    case 'groceryPlan':
      return (
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="font-medium">{card.plan.itemCount} items this month</p>
            <MoneyText amount={card.plan.estimatedTotal} size="lg" tone="primary" />
            <p className="text-sm text-muted-foreground">
              Cheapest at {card.plan.cheapestStoreLabel} · bulk saves{' '}
              <MoneyText amount={card.plan.bulkSaving} size="sm" tone="success" />
            </p>
          </CardContent>
        </Card>
      )
  }
}
