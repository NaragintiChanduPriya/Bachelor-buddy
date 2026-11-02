import type { LucideIcon } from 'lucide-react'
import { Lightbulb } from 'lucide-react'
import { cn } from '@/utils/cn'

type Tone = 'primary' | 'success' | 'warning' | 'danger'

const toneClasses: Record<Tone, { box: string; icon: string }> = {
  primary: { box: 'border-primary/25 bg-primary/5', icon: 'bg-primary/15 text-primary' },
  success: { box: 'border-success/30 bg-success/5', icon: 'bg-success/15 text-success' },
  warning: { box: 'border-warning/35 bg-warning/10', icon: 'bg-warning/20 text-warning' },
  danger: { box: 'border-destructive/30 bg-destructive/5', icon: 'bg-destructive/15 text-destructive' },
}

export interface InsightCalloutProps {
  title?: string
  children: React.ReactNode
  icon?: LucideIcon
  tone?: Tone
  /** Optional trailing slot, e.g. an AgentBadge or a button. */
  aside?: React.ReactNode
  className?: string
}

/** The highlighted "agent insight" strip used across pages: bulk saving, verdicts, rent gaps. */
export function InsightCallout({
  title,
  children,
  icon: Icon = Lightbulb,
  tone = 'primary',
  aside,
  className,
}: InsightCalloutProps) {
  const styles = toneClasses[tone]
  return (
    <div
      className={cn(
        'flex flex-wrap items-start gap-3 rounded-xl border p-4 sm:flex-nowrap',
        styles.box,
        className,
      )}
    >
      <span
        className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', styles.icon)}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        {title ? <p className="font-semibold leading-snug">{title}</p> : null}
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  )
}
