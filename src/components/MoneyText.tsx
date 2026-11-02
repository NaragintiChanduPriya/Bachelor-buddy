import { cn } from '@/utils/cn'
import { formatINR, formatINRCompact } from '@/utils/currency'

type Size = 'sm' | 'md' | 'lg' | 'xl' | 'hero'
type Tone = 'default' | 'muted' | 'success' | 'warning' | 'danger' | 'primary'

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl font-semibold',
  xl: 'text-3xl font-bold tracking-tight',
  hero: 'text-4xl font-bold tracking-tight sm:text-5xl',
}

const toneClasses: Record<Tone, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
  primary: 'text-primary',
}

export interface MoneyTextProps {
  amount: number
  size?: Size
  tone?: Tone
  compact?: boolean
  /** Prefix a + or - sign, for differences and savings. */
  signed?: boolean
  className?: string
}

/** The one component that renders rupee amounts, always with tabular figures. */
export function MoneyText({
  amount,
  size = 'md',
  tone = 'default',
  compact = false,
  signed = false,
  className,
}: MoneyTextProps) {
  const rounded = Math.round(amount)
  const formatted = compact ? formatINRCompact(Math.abs(rounded)) : formatINR(Math.abs(rounded))
  const sign = signed ? (rounded > 0 ? '+' : rounded < 0 ? '−' : '') : rounded < 0 ? '−' : ''

  return (
    <span className={cn('tabular', sizeClasses[size], toneClasses[tone], className)}>
      {sign}
      {formatted}
    </span>
  )
}
