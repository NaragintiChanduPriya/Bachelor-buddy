import { Link } from 'react-router-dom'
import { MessageCircleHeart, Plus, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** A quiet row of the four things people do most, so the dashboard stays about the numbers. */
export function QuickActions({ onLogExpense }: { onLogExpense: () => void }) {
  return (
    <nav aria-label="Quick actions" className="flex flex-wrap gap-2">
      <Button asChild>
        <Link to="/chat">
          <MessageCircleHeart aria-hidden="true" />
          Ask Buddy
        </Link>
      </Button>
      <Button variant="outline" onClick={onLogExpense}>
        <Plus aria-hidden="true" />
        Log expense
      </Button>
      <Button asChild variant="outline">
        <Link to="/food?near=office">
          <UtensilsCrossed aria-hidden="true" />
          Find food
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/shop">
          <ShoppingBag aria-hidden="true" />
          Compare prices
        </Link>
      </Button>
    </nav>
  )
}
