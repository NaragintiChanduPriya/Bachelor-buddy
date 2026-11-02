import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { MoneyText } from './MoneyText'
import { cn } from '@/utils/cn'

type Tone = 'default' | 'success' | 'warning' | 'danger' | 'primary'

const iconTone: Record<Tone, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-destructive/10 text-destructive',
}

const valueTone: Record<Tone, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
}

export interface StatCardProps {
  label: string
  /** Pass `amount` for money, or `value` for anything else. */
  amount?: number
  value?: string
  hint?: string
  icon?: LucideIcon
  tone?: Tone
  className?: string
}

export function StatCard({
  label,
  amount,
  value,
  hint,
  icon: Icon,
  tone = 'default',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon ? (
            <span
              className={cn('flex size-8 items-center justify-center rounded-lg', iconTone[tone])}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
          ) : null}
        </div>
        {amount !== undefined ? (
          <MoneyText amount={amount} size="xl" tone={tone} className="block" />
        ) : (
          <p className={cn('text-3xl font-bold tracking-tight tabular', valueTone[tone])}>{value}</p>
        )}
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
