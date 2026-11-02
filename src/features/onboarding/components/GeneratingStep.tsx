import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const steps = [
  'Reading your salary and goal…',
  'Splitting it into category budgets…',
  'Finding food and homes near you…',
  'Setting up your agents…',
]

/** Reveals the generation steps one by one while POST /onboarding is in flight. */
export function GeneratingStep({ done }: { done: boolean }) {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(1)

  useEffect(() => {
    if (visible >= steps.length) return
    const timer = setTimeout(() => setVisible((v) => v + 1), 550)
    return () => clearTimeout(timer)
  }, [visible])

  return (
    <div className="space-y-6 py-6" role="status" aria-live="polite">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Generating your budget…</h1>
        <p className="text-sm text-muted-foreground">This takes a moment.</p>
      </div>

      <ul className="mx-auto max-w-sm space-y-3">
        {steps.slice(0, visible).map((step, index) => {
          const complete = done || index < visible - 1
          return (
            <motion.li
              key={step}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              className="flex items-center gap-3 text-sm"
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full',
                  complete ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
                )}
              >
                {complete ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                )}
              </span>
              <span className={complete ? 'text-foreground' : 'text-muted-foreground'}>{step}</span>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
