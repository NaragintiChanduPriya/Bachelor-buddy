import { Clock3, Coins, CreditCard, TicketPercent } from 'lucide-react'
import type { Offer } from '@/types/offer'
import { daysLeftLabel, offerHeadline } from '@/utils/offers'
import { cn } from '@/utils/cn'

const kindIcon = {
  card: CreditCard,
  coupon: TicketPercent,
  cashback: Coins,
} as const

export interface OfferChipProps {
  offer: Offer
  className?: string
}

/** A compact pill: who funds it, the terms, and how long it lasts. */
export function OfferChip({ offer, className }: OfferChipProps) {
  const Icon = kindIcon[offer.kind]
  const who = offer.bank ? `${offer.bank} ${offer.cardType ?? ''}`.trim() : offer.platform

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs',
        offer.eligible ? 'border-primary/25 bg-primary/5' : 'border-border bg-muted/50 opacity-80',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full',
          offer.eligible ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      <span className="truncate">
        <span className="font-semibold">{offerHeadline(offer)}</span>
        <span className="text-muted-foreground"> · {who}</span>
      </span>
      <span
        className={cn(
          'flex shrink-0 items-center gap-1 font-medium',
          offer.expiringSoon ? 'text-warning' : 'text-muted-foreground',
        )}
      >
        <Clock3 className="size-3" aria-hidden="true" />
        {daysLeftLabel(offer.daysLeft)}
      </span>
    </span>
  )
}
