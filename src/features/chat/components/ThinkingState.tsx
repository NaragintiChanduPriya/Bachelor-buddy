import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * While a reply is in flight we do not yet know the real steps, so we show a generic sequence.
 * Once the reply arrives its own `steps` are rendered by the message itself.
 */
const placeholderSteps = [
  'Understanding your question…',
  'Checking your budget…',
  'Asking the right agents…',
  'Putting an answer together…',
]

export function ThinkingState() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(1)

  useEffect(() => {
    if (visible >= placeholderSteps.length) return
    const timer = setTimeout(() => setVisible((v) => v + 1), 600)
    return () => clearTimeout(timer)
  }, [visible])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Buddy is thinking"
      className="max-w-[85%] space-y-2 rounded-2xl rounded-tl-sm border border-border bg-card p-4"
    >
      <ul className="space-y-2">
        {placeholderSteps.slice(0, visible).map((step, index) => {
          const done = index < visible - 1
          return (
            <motion.li
              key={step}
              initial={reduceMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full',
                  done ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
                )}
              >
                {done ? (
                  <Check className="size-3" aria-hidden="true" />
                ) : (
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                )}
              </span>
              <span className={done ? 'text-muted-foreground' : 'text-foreground'}>{step}</span>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
