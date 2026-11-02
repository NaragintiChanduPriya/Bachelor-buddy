import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

const stepLabels = ['Welcome', 'Money', 'Areas', 'Preferences']

export function StepProgress({ step }: { step: number }) {
  const current = Math.min(step, stepLabels.length - 1)

  return (
    <nav aria-label="Signup progress">
      <ol className="flex items-center gap-2">
        {stepLabels.map((label, index) => {
          const done = index < current
          const active = index === current
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  done && 'bg-success text-success-foreground',
                  active && 'bg-primary text-primary-foreground',
                  !done && !active && 'bg-muted text-muted-foreground',
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:inline',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              {index < stepLabels.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn('h-px flex-1', done ? 'bg-success' : 'bg-border')}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
      <p className="sr-only">
        Step {current + 1} of {stepLabels.length}: {stepLabels[current]}
      </p>
    </nav>
  )
}
