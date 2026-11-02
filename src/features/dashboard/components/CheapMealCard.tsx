import { Link } from 'react-router-dom'
import { MapPin, UtensilsCrossed } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AgentBadge } from '@/components/AgentBadge'

/**
 * Phase 2 renders this from the Food agent's notification, which already carries the
 * suggestion text and a deep link. Phase 3 swaps it for a live /food/nearby card.
 */
export interface CheapMealCardProps {
  title: string
  body: string
  link: string | null
}

export function CheapMealCard({ title, body, link }: CheapMealCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <UtensilsCrossed className="size-4 text-primary" aria-hidden="true" />
            Today&rsquo;s cheap meal
          </CardTitle>
          <AgentBadge agent="food" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{body}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={link ?? '/food?near=office'}>
            <MapPin aria-hidden="true" />
            See options near office
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
