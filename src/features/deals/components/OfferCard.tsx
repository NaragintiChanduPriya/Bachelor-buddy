import { useState } from 'react'
import { Check, Clock3, Coins, Copy, CreditCard, Lock, TicketPercent } from 'lucide-react'
import type { Offer } from '@/types/offer'
import { MoneyText } from '@/components/MoneyText'
import { formatDate } from '@/utils/date'
import { daysLeftLabel } from '@/utils/offers'
import { cn } from '@/utils/cn'

const kindMeta = {
  card: { label: 'Card offer', icon: CreditCard },
  coupon: { label: 'Coupon', icon: TicketPercent },
  cashback: { label: 'Cashback', icon: Coins },
} as const

/** One offer, with the worked "true final price" example the backend computed for it. */
export function OfferCard({ offer }: { offer: Offer }) {
  const [copied, setCopied] = useState(false)
  const meta = kindMeta[offer.kind]
  const Icon = meta.icon

  const copyCode = async () => {
    if (!offer.code) return
    try {
      await navigator.clipboard.writeText(offer.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked — the code is still visible to copy by hand.
    }
  }

  return (
    <article
      className={cn(
        'flex h-full flex-col gap-4 rounded-xl border bg-card p-4 shadow-card',
        offer.eligible ? 'border-border' : 'border-dashed border-border opacity-75',
        offer.eligible && offer.expiringSoon && 'border-warning/50',
      )}
    >
      <header className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            offer.eligible ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            {offer.platform} · {meta.label}
          </p>
          <h3 className="font-semibold leading-snug">{offer.title}</h3>
          <p className="text-sm text-muted-foreground">{offer.description}</p>
        </div>
      </header>

      {/* The true final price on a typical order — the number the headline % hides. */}
      <div className="rounded-lg bg-muted/50 p-3">
        <p className="text-xs font-medium text-muted-foreground">
          On a{' '}
          <MoneyText
            amount={offer.example.orderValue}
            size="sm"
            className="text-xs font-semibold text-foreground"
          />{' '}
          order you pay
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <MoneyText
            amount={offer.example.finalPrice}
            size="lg"
            tone={offer.eligible ? 'primary' : 'muted'}
          />
          <span className="text-sm text-muted-foreground">
            save{' '}
            <MoneyText
              amount={offer.example.discount}
              size="sm"
              tone={offer.eligible ? 'success' : 'muted'}
              className="font-semibold"
            />
          </span>
        </div>
      </div>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <span
          className={cn(
            'flex items-center gap-1 text-xs font-medium',
            offer.expiringSoon ? 'text-warning' : 'text-muted-foreground',
          )}
        >
          <Clock3 className="size-3.5" aria-hidden="true" />
          {daysLeftLabel(offer.daysLeft)} · till {formatDate(offer.validTill)}
        </span>

        {!offer.eligible ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden="true" />
            {offer.ineligibleReason ?? 'Not available on your cards'}
          </span>
        ) : offer.code ? (
          <button
            type="button"
            onClick={() => void copyCode()}
            className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-primary/50 bg-primary/5 px-2 py-1 font-mono text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
            aria-label={copied ? `Copied ${offer.code}` : `Copy code ${offer.code}`}
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            {offer.code}
          </button>
        ) : (
          <span className="text-xs text-success">Applied automatically</span>
        )}
      </footer>
    </article>
  )
}
