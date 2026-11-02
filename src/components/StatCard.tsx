import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { MoneyText } from './MoneyText'
import { cn } from '@/utils/cn'

export interface StatCardProps {
  label: string
  /** Pass `amount` for money, or `value` for anything else. */
  amount?: number
  value?: string
  hint?: string
  icon?: LucideIcon
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'primary'
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
      <CardContent className="space-y-1 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon ? <Icon className="size-4 text-muted-foreground" aria-hidden="true" /> : null}
        </div>
        {amount !== undefined ? (
          <MoneyText amount={amount} size="xl" tone={tone} />
        ) : (
          <p className="text-3xl font-bold tracking-tight tabular">{value}</p>
        )}
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
