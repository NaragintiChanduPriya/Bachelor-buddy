import { Wallet2 } from 'lucide-react'
import { cn } from '@/utils/cn'

/** The logo tile. Decorative: the wordmark beside it, or an aria-label, names the app. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-brand flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-raised ring-1 ring-white/20',
        className,
      )}
    >
      <Wallet2 className="size-5" />
    </span>
  )
}
