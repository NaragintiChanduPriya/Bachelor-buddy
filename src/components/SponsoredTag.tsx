import { Megaphone } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Trust rule: sponsored items are always clearly labelled, and are never ranked above a
 * cheaper option. This label makes the first half visible; the ranking is enforced server-side.
 */
export function SponsoredTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground',
        className,
      )}
    >
      <Megaphone className="size-3" aria-hidden="true" />
      Sponsored
    </span>
  )
}
