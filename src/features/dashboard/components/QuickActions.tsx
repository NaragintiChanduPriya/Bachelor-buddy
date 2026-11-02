import { Link } from 'react-router-dom'
import { MessageCircleHeart, Plus, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function QuickActions({ onLogExpense }: { onLogExpense: () => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <Button asChild size="lg">
        <Link to="/chat">
          <MessageCircleHeart aria-hidden="true" />
          Ask Buddy
        </Link>
      </Button>
      <Button variant="outline" size="lg" onClick={onLogExpense}>
        <Plus aria-hidden="true" />
        Log expense
      </Button>
      <Button asChild variant="outline" size="lg">
        <Link to="/food?near=office">
          <UtensilsCrossed aria-hidden="true" />
          Find food
        </Link>
      </Button>
    </div>
  )
}
